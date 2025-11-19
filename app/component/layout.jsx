"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
    const [active, setActive] = useState("home");
    const [menuOpen, setMenuOpen] = useState(false);

    // Logout function (works on both desktop & mobile)
    const logout = async () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
    };

    const links = [
        { name: "Home", href: "/" },
        { name: "Screen Share", href: "/screenshare" },
        { name: "Profile", href: "/profile" },
        { name: "Settings", href: "/settings" },
    ];

    return (
        <nav className="fixed w-full top-0 left-0 z-50 bg-white/30 backdrop-blur-md shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
                {/* Logo */}
                <div className="text-2xl font-bold text-indigo-600 animate-bounce">
                    ShareMate
                </div>

                {/* Desktop Links */}
                <ul className="hidden md:flex gap-6 items-center">
                    {links.map((link) => (
                        <li
                            key={link.name}
                            onClick={() => setActive(link.name.toLowerCase())}
                            className="relative cursor-pointer text-gray-700 font-medium hover:text-indigo-600 transition-all"
                        >
                            <Link href={link.href}>{link.name}</Link>
                            {active === link.name.toLowerCase() && (
                                <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-indigo-600 rounded-full animate-slideIn"></span>
                            )}
                        </li>
                    ))}

                    <li>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-all"
                        >
                            Logout
                        </button>
                    </li>
                </ul>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden text-gray-700 focus:outline-none"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                                menuOpen
                                    ? "M6 18L18 6M6 6l12 12"
                                    : "M4 6h16M4 12h16M4 18h16"
                            }
                        />
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <ul className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg flex flex-col items-center gap-4 py-4 animate-fadeIn">
                    {links.map((link) => (
                        <li
                            key={link.name}
                            onClick={() => {
                                setActive(link.name.toLowerCase());
                                setMenuOpen(false);
                            }}
                            className={`cursor-pointer text-gray-700 font-medium hover:text-indigo-600 transition-all ${active === link.name.toLowerCase() ? "text-indigo-600" : ""
                                }`}
                        >
                            <Link href={link.href}>{link.name}</Link>
                        </li>
                    ))}

                    <li>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-all"
                        >
                            Logout
                        </button>
                    </li>
                </ul>
            )}

            {/* Animations */}
            <style jsx>{`
        @keyframes slideIn {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease forwards;
          transform-origin: left;
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
      `}</style>
        </nav>
    );
}
