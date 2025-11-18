"use client";

export default function LoadingPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-100 to-blue-200">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mb-6"></div>
            <h1 className="text-2xl font-semibold text-blue-700">Loading...</h1>
            <p className="text-blue-500 mt-2">Please wait while we fetch your data</p>
        </div>
    );
}
