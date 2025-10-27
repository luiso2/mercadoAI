import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  googleSub: string;
  email?: string;
  name?: string;
  picture?: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    googleSub: { type: String, required: true, unique: true, index: true },
    email: { type: String },
    name: { type: String },
    picture: { type: String },
    roles: { type: [String], default: ['user'] },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', userSchema);
