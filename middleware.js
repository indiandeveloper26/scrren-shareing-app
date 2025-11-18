import { NextResponse } from "next/server";

export function middleware(req) {
    const token = req.cookies.get("auth_token")?.value;

    // If NO token → redirect to login
    console.log('tokne', token)
    if (!token) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = "/login";
        return NextResponse.redirect(loginUrl);
    }

    // token exists → allow
    return NextResponse.next();
}

// Protect routes
export const config = {
    matcher: [
        "/dashboard/:path*",   // dashboard protected
        "/profile/:path*",     // profile protected
    ],
};
