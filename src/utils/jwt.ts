import jwt from 'jsonwebtoken';
import { env } from '../env.js';

export interface JWTPayload {
  uid: string;
  email?: string;
  name?: string;
  roles?: string[];
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    algorithm: 'HS256',
  } as any);
}

export function verifyToken(token: string): JWTPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    algorithms: ['HS256'],
  }) as JWTPayload;

  return decoded;
}
