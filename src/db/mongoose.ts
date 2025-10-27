import mongoose from 'mongoose';
import { env } from '../env.js';

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}
