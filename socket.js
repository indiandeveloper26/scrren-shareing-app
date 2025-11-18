import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);

    // Socket.IO attach
    const io = new Server(httpServer, {
        cors: { origin: "*" },
    });

    let users = {};

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("register", (name) => {
            users[socket.id] = name;
            io.emit("users", users);
        });

        socket.on("call-user", ({ targetId, offer }) => {
            io.to(targetId).emit("offer", { from: socket.id, offer, name: users[socket.id] });
        });

        socket.on("answer-user", ({ targetId, answer }) => {
            io.to(targetId).emit("answer", { answer });
        });

        socket.on("candidate", ({ targetId, candidate }) => {
            io.to(targetId).emit("candidate", candidate);
        });

        socket.on("disconnect", () => {
            delete users[socket.id];
            io.emit("users", users);
            console.log("User disconnected:", socket.id);
        });
    });

    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
