// pages/api/socket.js
import { Server } from "socket.io";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default function handler(req, res) {
    if (!res.socket.server.io) {
        console.log("Initializing Socket.IO server...");
        const io = new Server(res.socket.server, {
            path: "/api/socket",
            cors: { origin: "*" },
        });

        res.socket.server.io = io;

        let users = {};

        io.on("connection", (socket) => {
            console.log("User connected:", socket.id);

            // register user
            socket.on("register", (name) => {
                users[socket.id] = name;
                io.emit("users", users);
            });

            // call user
            socket.on("call-user", ({ targetId, offer }) => {
                io.to(targetId).emit("offer", { from: socket.id, offer, name: users[socket.id] });
            });

            // answer user
            socket.on("answer-user", ({ targetId, answer }) => {
                io.to(targetId).emit("answer", { answer });
            });

            // ICE candidates
            socket.on("candidate", ({ targetId, candidate }) => {
                io.to(targetId).emit("candidate", candidate);
            });

            // disconnect
            socket.on("disconnect", () => {
                delete users[socket.id];
                io.emit("users", users);
                console.log("User disconnected:", socket.id);
            });
        });
    } else {
        console.log("Socket.IO already running");
    }

    res.end();
}
