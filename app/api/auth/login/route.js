

import bcrypt from "bcryptjs";

import { connectDB } from "@/app/lib/db";
import User from "@/app/models/user";
import { createToken } from "@/app/lib/auth";

export async function POST(req) {
    await connectDB();

    const { email, password } = await req.json();
    const user = await User.findOne({ email });

    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return Response.json({ error: "Invalid credentials" }, { status: 400 });

    const token = createToken(user);
    console.log('dta', user)

    return Response.json({ user, token });
}
