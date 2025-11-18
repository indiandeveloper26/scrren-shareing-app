// import { createServer } from "node:http";
// import next from "next";
// import { Server } from "socket.io";

// const dev = process.env.NODE_ENV !== "production";
// const hostname = "localhost";
// const port = 3001;


// const app = next({ dev, hostname, port });
// const handler = app.getRequestHandler();

// app.prepare().then(() => {
//     const server = createServer(handler);

//     const io = new Server(server, {
//         cors: { origin: "*" },
//     });

//     let users = {};

//     io.on("connection", (socket) => {
//         console.log("User connectedt:", socket.id);

//         socket.on("register", (name) => {
//             users[socket.id] = name;
//             console.log('userconnect-', name)
//             io.emit("users", users);
//         });

//         socket.on("call-user", ({ targetId, offer }) => {
//             io.to(targetId).emit("offer", { from: socket.id, offer });
//         });

//         socket.on("answer-user", ({ targetId, answer }) => {
//             io.to(targetId).emit("answer", { answer });
//         });

//         socket.on("candidate", ({ targetId, candidate }) => {
//             io.to(targetId).emit("candidate", candidate);
//         });
//         socket.on("chat-message", ({ to, text, from }) => {
//             const targetSocket = Object.keys(users).find(key => users[key] === to);
//             const msg = { text, from, to, timestamp: Date.now() };
//             console.log('dta', to)
//             // Send to recipient only
//             if (targetSocket) io.to(targetSocket).emit("chat-message", msg);

//             // Send to sender so UI updates instantly
//             socket.emit("chat-message", msg);
//         });
//         socket.on("disconnect", () => {
//             delete users[socket.id];
//             io.emit("users", users);
//             console.log("User disconnected:", socket.id);
//         });
//     });

//     server.listen(port, () => {
//         console.log(`> Server ready on http://${hostname}:${port}`);
//     });
// });









// server.js (root folder mein)

import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer((req, res) => {
        handle(req, res);
    });

    const io = new Server(server, {
        path: "/socket.io",           // ← yeh add kar de
        cors: { origin: "*" },
    });

    let users = {};

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("register", (name) => {
            users[socket.id] = name;
            console.log("Registered:", name);
            io.emit("users", users);
        });

        socket.on("call-user", ({ targetId, offer }) => {
            io.to(targetId).emit("offer", { from: socket.id, offer });
        });

        socket.on("answer-user", ({ targetId, answer }) => {
            io.to(targetId).emit("answer", { answer });
        });

        socket.on("candidate", ({ targetId, candidate }) => {
            io.to(targetId).emit("candidate", candidate);
        });

        socket.on("chat-message", ({ to, text, from }) => {
            const targetSocketId = Object.keys(users).find(key => users[key] === to);
            const msg = { text, from, to, timestamp: Date.now() };
            if (targetSocketId) io.to(targetSocketId).emit("chat-message", msg);
            socket.emit("chat-message", msg);
        });

        socket.on("disconnect", () => {
            delete users[socket.id];
            io.emit("users", users);
        });
    });

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
        console.log(`App + Socket.io running on http://localhost:${PORT}`);
        console.log(`Socket path: http://localhost:${PORT}/socket.io`);
    });
});