"use client";

import Link from "next/link";
import { useState } from "react";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [userdta, setuserdta] = useState('')

    const signup = async () => {
        setLoading(true);
        setError("");

        const res = await fetch("/api/auth/signup", {
            method: "POST",
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        console.log('dta', data.user)
        setuserdta(data)
        setLoading(false);

        if (data.error) {
            setError(data.error);
            return;
        }
        window.location.href = "/screenshare";

        if (data.token) {
            localStorage.setItem("token", data.token);
            window.location.href = "/dashboard";
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
            <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">

                <h1 className="text-3xl font-bold text-center text-white mb-6">
                    Create Account
                </h1>

                {error && (
                    <p className="text-red-400 text-center mb-3">{error}</p>
                )}

                <div className="flex flex-col gap-4">

                    <input
                        className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Full Name"
                        onChange={(e) => setName(e.target.value)}
                    />

                    <input
                        className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Email Address"
                        type="email"
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Password"
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        onClick={signup}
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition-all text-white rounded-xl font-semibold shadow-lg disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Sign Up"}
                    </button>
                </div>

                <p className="text-center text-gray-300 mt-4">
                    Already have an account?{" "}
                    <Link href="/" className="text-blue-400 hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
