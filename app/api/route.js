import { NextResponse } from "next/server";
import { connectDB } from "../lib/db";


export async function GET(req) {

    await connectDB()
    return NextResponse.json({ "this  1 cloudfare is get api roteu for testing now": "true" })
}
