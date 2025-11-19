"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function ChatPage() {
    const { id } = useParams();
    const socket = useRef(null);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [username, setUsername] = useState("");

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        socket.current = io("http://localhost:3001", { transports: ["websocket"] });

        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            const autoName = "User" + Math.floor(Math.random() * 1000);
            localStorage.setItem("user", JSON.stringify({ name: autoName }));
            setUsername(autoName);
            socket.current.emit("register", autoName);
        } else {
            const userObj = JSON.parse(storedUser);
            setUsername(userObj.name);
            socket.current.emit("register", userObj.name);
        }

        socket.current.on("chat-message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => socket.current.disconnect();
    }, []);

    const sendMessage = () => {
        if (!input.trim()) return;
        const msg = { text: input, from: username, to: id };
        socket.current.emit("chat-message", msg);
        setInput("");
    };

    const handleKey = (e) => {
        if (e.key === "Enter") sendMessage();
    };

    return (
        <div className="flex mt-12 justify-center bg-gray-100 min-h-screen w-full">
            {/* Chat Container */}
            <div className="flex flex-col h-screen w-full max-w-[600px] md:h-[90vh] md:mt-4 md:mb-4 border rounded-2xl shadow-lg bg-white">
                {/* Header */}
                <div className="bg-blue-600 text-white p-4 shadow-md rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
                    <h1 className="text-lg font-semibold truncate">Chat with {id}</h1>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-gray-50">
                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`p-2 rounded-2xl max-w-[70%] break-words ${m.from === username
                                ? "bg-blue-500 text-white self-end"
                                : "bg-gray-300 text-gray-800 self-start"
                                }`}
                        >
                            <div className="text-xs font-semibold mb-1 truncate">{m.from}</div>
                            <div>{m.text}</div>
                        </div>
                    ))}
                    <div ref={messagesEndRef}></div>
                </div>

                {/* Input */}
                <div className="flex p-4 gap-2 bg-gray-100 border-t border-gray-300 rounded-b-2xl">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        onClick={sendMessage}
                        className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
