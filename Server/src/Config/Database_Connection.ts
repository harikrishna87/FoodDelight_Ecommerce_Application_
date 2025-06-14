import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('DATABASE_URI is not defined in environment variables');
        }
        
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error('Database connection error:', error.message);
        process.exit(1);
    }
};

export default connectDB;