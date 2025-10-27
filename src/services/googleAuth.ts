import { OAuth2Client } from 'google-auth-library';
import { env } from '../env.js';

const client = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

export async function verifyGoogleIdToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error('Invalid ID token payload');
  }

  return {
    googleSub: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  };
}

export function getGoogleAuthUrl(state: string): string {
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    state,
    prompt: 'consent',
  });
}

export async function getGoogleTokens(code: string) {
  const { tokens } = await client.getToken(code);
  return tokens;
}
