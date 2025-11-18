import { cookies } from "next/headers";

export async function POST(req) {
    try {
        // Clear the auth cookie
        const cookieStore = cookies();
        cookieStore.delete("auth_token"); // assuming your JWT stored in cookie "token"

        return new Response(JSON.stringify({ message: "Logged out successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Logout failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
