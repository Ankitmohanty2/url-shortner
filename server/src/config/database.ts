import mongoose from 'mongoose';
import { getEnv } from './env.js';

let isConnected = false;

export async function connectDatabase(): Promise<void> {
  if (isConnected) return;

  const { MONGODB_URI } = getEnv();

  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) return;

  await mongoose.disconnect();
  isConnected = false;
  console.log('MongoDB disconnected');
}

export function getConnectionStatus(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}