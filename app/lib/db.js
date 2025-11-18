import mongoose from "mongoose";

let isConnected = false; // to track connection

export const connectDB = async () => {
    if (isConnected) return;

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = true;
        console.log("MongoDB Connected");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        throw err;
    }
};
