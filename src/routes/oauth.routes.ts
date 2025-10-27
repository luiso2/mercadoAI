import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { getGoogleAuthUrl, getGoogleTokens, verifyGoogleIdToken } from '../services/googleAuth.js';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';

export const oauthRouter = Router();

interface OAuthGrant {
  code: string;
  codeChallenge: string;
  userId: string;
  expiresAt: number;
}

const grants = new Map<string, OAuthGrant>();

const authorizeSchema = z.object({
  response_type: z.literal('code'),
  client_id: z.string(),
  redirect_uri: z.string().url(),
  state: z.string(),
  code_challenge: z.string(),
  code_challenge_method: z.literal('S256'),
  scope: z.string().optional(),
});

oauthRouter.get('/authorize', (req, res, next) => {
  try {
    const params = authorizeSchema.parse(req.query);

    (req.session as any).oauthState = {
      state: params.state,
      redirect_uri: params.redirect_uri,
      code_challenge: params.code_challenge,
    };

    const googleAuthUrl = getGoogleAuthUrl(params.state);
    res.redirect(googleAuthUrl);
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

    const oauthState = (req.session as any).oauthState;

    if (!oauthState || oauthState.state !== state) {
      throw new Error('Invalid state parameter');
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

    delete (req.session as any).oauthState;

    const redirectUrl = new URL(oauthState.redirect_uri);
    redirectUrl.searchParams.set('code', grantCode);
    redirectUrl.searchParams.set('state', state as string);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    next(error);
  }
});

const tokenSchema = z.object({
  grant_type: z.literal('authorization_code'),
  code: z.string(),
  code_verifier: z.string(),
  redirect_uri: z.string().url().optional(),
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

    const hash = crypto.createHash('sha256').update(body.code_verifier).digest('base64url');

    if (hash !== grant.codeChallenge) {
      grants.delete(body.code);
      res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid code verifier' });
      return;
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
