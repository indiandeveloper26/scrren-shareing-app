"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const socket = useRef(null);
    const [users, setUsers] = useState({});
    const [name, setName] = useState("");

    useEffect(() => {
        socket.current = io("https://scrren-backend.onrender.com");
        socket.current.on("users", (u) => setUsers(u));
        return () => socket.current.disconnect();
    }, []);

    const register = (username) => {
        setName(username);
        socket.current.emit("register", username);
    };

    return (
        <SocketContext.Provider value={{ socket, users, name, register }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
