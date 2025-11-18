import { NextResponse } from "next/server";


export async function GET(req) {
    return NextResponse.json({ "this is get api roteu for testing now": "true" })
}
