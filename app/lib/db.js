import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) return;

    try {
        await mongoose.connect('mongodb+srv://akgaud079:sahilmummy@cluster0.pcpf2.mongodb.net/', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = true;
        console.log("MongoDB Connected");
    } catch (err) {
        console.log("MongoDB connection error:", err);
        throw err;
    }
};
