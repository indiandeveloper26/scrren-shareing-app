import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Usernext from "@/app/models/user";


export async function POST(req) {
    try {
        await connectDB();
        const { email, password } = await req.json();



        const user = await Usernext.findOne({ email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });

        const token = jwt.sign({ id: user._id }, "sahil12345", { expiresIn: "7d" });
        console.log('dta',)
        const res = NextResponse.json({
            message: "Login successful",
            user: { id: user._id, name: user.name, email: user.email },
        });

        res.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        });


        return res;
    } catch (err) {
        console.error("Login Error:", err);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
