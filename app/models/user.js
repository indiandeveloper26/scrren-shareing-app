


import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
    },
    { timestamps: true }
);

// **Same name** use karo check aur create ke liye
const User = mongoose.models.shareuser || mongoose.model("shareuser", userSchema);

export default User;
