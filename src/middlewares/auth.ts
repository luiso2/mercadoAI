import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
    roles?: string[];
  };
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid Authorization header' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    req.user = {
      uid: payload.uid,
      email: payload.email,
      name: payload.name,
      roles: payload.roles,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
