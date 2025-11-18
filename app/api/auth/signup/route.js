// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { NextResponse } from "next/server";

// import User from "@/app/models/user";
// import { connectDB } from "@/app/lib/db";


// export async function POST(req) {
//     try {
//         await connectDB();
//         const { name, email, password } = await req.json();

//         if (!name || !email || !password) {
//             return NextResponse.json({ error: "All fields required" }, { status: 400 });
//         }

//         const exist = await User.findOne({ email });
//         if (exist) {
//             return NextResponse.json({ error: "Email already exists" }, { status: 400 });
//         }

//         const hash = await bcrypt.hash(password, 10);

//         const user = await User.create({
//             name,
//             email,
//             password: hash,
//         });

//         // JWT Create
//         const token = jwt.sign(
//             { id: user._id },
//             process.env.JWT_SECRET,
//             { expiresIn: "7d" }
//         );

//         // RESPONSE + COOKIE
//         const res = NextResponse.json({
//             message: "Signup successful",
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//             }
//         });

//         // Set Cookie (HTTP-Only)
//         res.cookies.set("auth_token", token, {
//             httpOnly: true,
//             secure: true,
//             sameSite: "strict",
//             maxAge: 7 * 24 * 60 * 60, // 7 days
//             path: "/"
//         });

//         return res;
//     } catch (err) {
//         console.log("Signup Error:", err);
//         return NextResponse.json({ error: "Server Error" }, { status: 500 });
//     }
// }










import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import User from "@/app/models/user";
import { connectDB } from "@/app/lib/db";


export async function POST(req) {
    try {
        await connectDB();
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "All fields required" }, { status: 400 });
        }

        const exist = await User.findOne({ email });
        if (exist) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await User.create({ name, email, password: hash });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        const res = NextResponse.json({
            message: "Signup successful",
            user: { id: user._id, name: user.name, email: user.email },
        });

        res.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        });

        return res;
    } catch (err) {
        console.log("Signup Error:", err);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
