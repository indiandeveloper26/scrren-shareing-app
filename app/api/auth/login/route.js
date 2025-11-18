import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { connectDB } from "@/app/lib/db";
import User from "@/app/models/user";
import { createToken } from "@/app/lib/auth";

export async function POST(req) {
    try {
        await connectDB();

        const { email, password } = await req.json();
        const user = await User.findOne({ email });

        if (!user)
            return NextResponse.json({ error: "User not found" }, { status: 404 });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
            return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });

        const token = createToken(user); // JWT creation

        const res = NextResponse.json({ user, token });

        // Optional: HTTP-only cookie
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
