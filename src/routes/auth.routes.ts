import { Router } from 'express';
import { z } from 'zod';
import { verifyGoogleIdToken } from '../services/googleAuth.js';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';

export const authRouter = Router();

const verifySchema = z.object({
  idToken: z.string().min(1),
});

authRouter.post('/google/verify', async (req, res, next) => {
  try {
    const body = verifySchema.parse(req.body);

    const googleUser = await verifyGoogleIdToken(body.idToken);

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

    const token = signToken({
      uid: (user._id as any).toString(),
      email: user.email,
      name: user.name,
      roles: user.roles,
    });

    res.json({
      token,
      user: {
        id: (user._id as any).toString(),
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    next(error);
  }
});
