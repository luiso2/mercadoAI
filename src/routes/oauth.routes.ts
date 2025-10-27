import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { getGoogleTokens, verifyGoogleIdToken } from '../services/googleAuth.js';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';

export const oauthRouter = Router();

interface OAuthGrant {
  code: string;
  codeChallenge?: string;
  userId: string;
  expiresAt: number;
}

const grants = new Map<string, OAuthGrant>();

// Store OAuth state temporarily (for redirect flow)
interface OAuthState {
  state: string;
  redirect_uri: string;
  code_challenge?: string;
  expiresAt: number;
}

const oauthStates = new Map<string, OAuthState>();

// Clean up expired states every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of oauthStates.entries()) {
    if (data.expiresAt < now) {
      oauthStates.delete(state);
    }
  }
  // Also clean expired grants
  for (const [code, grant] of grants.entries()) {
    if (grant.expiresAt < now) {
      grants.delete(code);
    }
  }
}, 5 * 60 * 1000);

const authorizeSchema = z.object({
  response_type: z.literal('code'),
  client_id: z.string(),
  redirect_uri: z.string().url(),
  state: z.string(),
  code_challenge: z.string().optional(),
  code_challenge_method: z.enum(['S256', 'plain']).optional(),
  scope: z.string().optional(),
});

oauthRouter.get('/authorize', (req, res, next) => {
  try {
    const params = authorizeSchema.parse(req.query);

    // Store state in memory for the verify endpoint to use later
    oauthStates.set(params.state, {
      state: params.state,
      redirect_uri: params.redirect_uri,
      code_challenge: params.code_challenge,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Return HTML page with Google Sign-In button (client-side OAuth)
    // This avoids cross-domain redirect issues
    res.setHeader('Content-Type', 'text/html');
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authorize Mercado AI</title>
  <script src="https://accounts.google.com/gsi/client" async defer></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      background: white;
      padding: 3rem;
      border-radius: 1rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 400px;
    }
    h1 {
      color: #333;
      margin-bottom: 0.5rem;
      font-size: 1.75rem;
    }
    p {
      color: #666;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    #buttonDiv {
      display: flex;
      justify-content: center;
      margin-top: 1.5rem;
    }
    .loading {
      display: none;
      color: #667eea;
      margin-top: 1rem;
    }
    .error {
      display: none;
      color: #e74c3c;
      margin-top: 1rem;
      padding: 1rem;
      background: #ffe6e6;
      border-radius: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🛒 Mercado AI</h1>
    <p>Sign in with your Google account to continue</p>

    <div id="buttonDiv"></div>
    <div class="loading" id="loading">Verifying your account...</div>
    <div class="error" id="error"></div>
  </div>

  <script>
    const GOOGLE_CLIENT_ID = '${process.env.GOOGLE_CLIENT_ID}';
    const STATE = '${params.state}';
    const BACKEND_URL = '${process.env.BASE_URL || 'https://mercadoai-backend-production.up.railway.app'}';

    function handleCredentialResponse(response) {
      document.getElementById('buttonDiv').style.display = 'none';
      document.getElementById('loading').style.display = 'block';

      // Send ID token to backend for verification
      fetch(BACKEND_URL + '/oauth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: response.credential,
          state: STATE
        })
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Verification failed');
        }
        return res.json();
      })
      .then(data => {
        // Redirect to ChatGPT with the authorization code
        window.location.href = data.redirect_url;
      })
      .catch(error => {
        console.error('Error:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').textContent = 'Authentication failed. Please try again.';
      });
    }

    window.onload = function() {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
      });

      google.accounts.id.renderButton(
        document.getElementById('buttonDiv'),
        {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left'
        }
      );

      // Also show the One Tap prompt
      google.accounts.id.prompt();
    };
  </script>
</body>
</html>
    `);
  } catch (error) {
    next(error);
  }
});

// New endpoint to verify ID token from client-side Google Sign-In
const verifySchema = z.object({
  idToken: z.string(),
  state: z.string(),
});

oauthRouter.post('/verify', async (req, res, next) => {
  try {
    const { idToken, state } = verifySchema.parse(req.body);

    // Retrieve state from memory store
    const oauthState = oauthStates.get(state);

    if (!oauthState) {
      res.status(400).json({ error: 'invalid_state', error_description: 'Invalid or expired state parameter' });
      return;
    }

    // Check expiration
    if (oauthState.expiresAt < Date.now()) {
      oauthStates.delete(state);
      res.status(400).json({ error: 'state_expired', error_description: 'State expired' });
      return;
    }

    // Verify ID token with Google
    const googleUser = await verifyGoogleIdToken(idToken);

    // Create or update user in database
    let user = await User.findOne({ googleSub: googleUser.googleSub });

    if (!user) {
      user = await User.create({
        googleSub: googleUser.googleSub,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      });
    } else {
      user.email = googleUser.email;
      user.name = googleUser.name;
      user.picture = googleUser.picture;
      await user.save();
    }

    // Generate authorization code
    const grantCode = crypto.randomBytes(32).toString('base64url');

    grants.set(grantCode, {
      code: grantCode,
      codeChallenge: oauthState.code_challenge,
      userId: (user._id as any).toString(),
      expiresAt: Date.now() + 60 * 1000, // 1 minute
    });

    // Clean up used state
    oauthStates.delete(state);

    // Build redirect URL for ChatGPT
    const redirectUrl = new URL(oauthState.redirect_uri);
    redirectUrl.searchParams.set('code', grantCode);
    redirectUrl.searchParams.set('state', state);

    res.json({
      redirect_url: redirectUrl.toString(),
      success: true,
    });
  } catch (error) {
    next(error);
  }
});

oauthRouter.get('/google/callback', async (req, res, next) => {
  try {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string') {
      throw new Error('Missing authorization code');
    }

    if (!state || typeof state !== 'string') {
      throw new Error('Missing state parameter');
    }

    // Retrieve state from memory store
    const oauthState = oauthStates.get(state);

    if (!oauthState) {
      throw new Error('Invalid or expired state parameter');
    }

    // Check expiration
    if (oauthState.expiresAt < Date.now()) {
      oauthStates.delete(state);
      throw new Error('State expired');
    }

    const tokens = await getGoogleTokens(code);

    if (!tokens.id_token) {
      throw new Error('Missing ID token');
    }

    const googleUser = await verifyGoogleIdToken(tokens.id_token);

    let user = await User.findOne({ googleSub: googleUser.googleSub });

    if (!user) {
      user = await User.create({
        googleSub: googleUser.googleSub,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      });
    } else {
      user.email = googleUser.email;
      user.name = googleUser.name;
      user.picture = googleUser.picture;
      await user.save();
    }

    const grantCode = crypto.randomBytes(32).toString('base64url');

    grants.set(grantCode, {
      code: grantCode,
      codeChallenge: oauthState.code_challenge,
      userId: (user._id as any).toString(),
      expiresAt: Date.now() + 60 * 1000,
    });

    // Clean up used state
    oauthStates.delete(state);

    const redirectUrl = new URL(oauthState.redirect_uri);
    redirectUrl.searchParams.set('code', grantCode);
    redirectUrl.searchParams.set('state', state);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    next(error);
  }
});

const tokenSchema = z.object({
  grant_type: z.literal('authorization_code'),
  code: z.string(),
  code_verifier: z.string().optional(),
  redirect_uri: z.string().url().optional(),
  client_id: z.string().optional(),
  client_secret: z.string().optional(),
});

oauthRouter.post('/token', async (req, res, next) => {
  try {
    const body = tokenSchema.parse(req.body);

    const grant = grants.get(body.code);

    if (!grant) {
      res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid authorization code' });
      return;
    }

    if (grant.expiresAt < Date.now()) {
      grants.delete(body.code);
      res.status(400).json({ error: 'invalid_grant', error_description: 'Authorization code expired' });
      return;
    }

    // Validate PKCE only if code_challenge was provided during authorization
    if (grant.codeChallenge) {
      if (!body.code_verifier) {
        grants.delete(body.code);
        res.status(400).json({ error: 'invalid_request', error_description: 'code_verifier is required when PKCE was used' });
        return;
      }

      const hash = crypto.createHash('sha256').update(body.code_verifier).digest('base64url');

      if (hash !== grant.codeChallenge) {
        grants.delete(body.code);
        res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid code verifier' });
        return;
      }
    }

    grants.delete(body.code);

    const user = await User.findById(grant.userId);

    if (!user) {
      res.status(400).json({ error: 'invalid_grant', error_description: 'User not found' });
      return;
    }

    const accessToken = signToken({
      uid: (user._id as any).toString(),
      email: user.email,
      name: user.name,
      roles: user.roles,
    });

    res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 604800,
      scope: 'openid email profile',
    });
  } catch (error) {
    next(error);
  }
});
