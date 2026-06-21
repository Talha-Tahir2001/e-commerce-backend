import mongoose from 'mongoose';
import { env } from './env.js';


const connectDB = async (): Promise<void> => {
  // if (env.MONGODB_URI === undefined) {
  //   throw new Error('MONGODB_URI is not defined in environment variables');
  // }
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(env.MONGODB_URI, {
        // appName: 'E-commerce API',
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;