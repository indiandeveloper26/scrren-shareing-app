"use client";

export default function ErrorPage({ error, reset }) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-red-50">
            <div className="bg-red-100 p-8 rounded-3xl shadow-lg flex flex-col items-center">
                <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
                <p className="text-red-500 mb-4">{error?.message || "Something went wrong."}</p>
                <button
                    onClick={() => reset?.()}
                    className="px-6 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
