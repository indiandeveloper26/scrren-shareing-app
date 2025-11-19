// app/not-found.js

'use client'
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white px-6">

            <h1 className="text-8xl font-extrabold tracking-wider drop-shadow-lg animate-pulse">404</h1>

            <p className="text-xl mt-3 opacity-80 text-center">
                Oops! The page you’re looking for doesn’t exist.
            </p>

            <div className="mt-8 flex gap-4">
                <Link
                    href="/"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-all rounded-lg shadow-lg text-lg"
                >
                    ← Go Home
                </Link>

                <button
                    onClick={() => history.back()}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-800 transition-all rounded-lg shadow-lg text-lg"
                >
                    ⤺ Go Back
                </button>
            </div>

            <style>{`
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%,100% { opacity: .7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
      `}</style>
        </div>
    );
}
