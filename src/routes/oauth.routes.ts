import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { getGoogleTokens, verifyGoogleIdToken } from '../services/googleAuth.js';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { env } from '../env.js';

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

    // Store state in memory (NOT in session - sessions don't work with OAuth redirects)
    oauthStates.set(params.state, {
      state: params.state,
      redirect_uri: params.redirect_uri,
      code_challenge: params.code_challenge,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Build Google OAuth URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.set('redirect_uri', env.GOOGLE_REDIRECT_URI);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('state', params.state);
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'consent');

    // Redirect to Google
    res.redirect(googleAuthUrl.toString());
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
