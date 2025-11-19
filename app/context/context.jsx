"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const socket = useRef(null);

    const [name, setName] = useState("");
    const [users, setUsers] = useState({});
    const [messages, setMessages] = useState([]);

    // Generate random username
    const generateName = () => {
        const adjectives = ["Fast", "Smart", "Cool", "Crazy", "Happy"];
        const nouns = ["Tiger", "Lion", "Eagle", "Shark", "Wolf"];
        return (
            adjectives[Math.floor(Math.random() * adjectives.length)] +
            nouns[Math.floor(Math.random() * nouns.length)] +
            Math.floor(Math.random() * 100)
        );
    };

    useEffect(() => {
        // Load user from localStorage
        let storedUser = localStorage.getItem("user");
        let username;
        if (!storedUser) {
            username = generateName();
            localStorage.setItem("user", JSON.stringify({ name: username }));
        } else {
            username = JSON.parse(storedUser).name;
        }
        setName(username);

        // Initialize Socket.IO
        socket.current = io("https://scrren-backend.onrender.com", { transports: ["websocket"] });

        socket.current.on("connect", () => {
            console.log("Connected with ID:", socket.current.id);
            socket.current.emit("register", username);
        });

        socket.current.on("users", (list) => {
            setUsers(list || {});
            localStorage.setItem("onlineUsers", JSON.stringify(list || {}));
        });

        socket.current.on("chat-message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => socket.current.disconnect();
    }, []);

    // Send message function
    const sendMessage = (msg) => {
        if (!msg.text) return;
        socket.current.emit("chat-message", msg);
        setMessages((prev) => [...prev, msg]);
    };

    return (
        <UserContext.Provider
            value={{
                name,
                users,
                messages,
                sendMessage,
                socket,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to use context
export const useUser = () => useContext(UserContext);
