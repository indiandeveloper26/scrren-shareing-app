// import next from "next";
// import { createServer } from "http";
// import { Server } from "socket.io";

// const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
// const handler = app.getRequestHandler();

// app.prepare().then(() => {
//     const httpServer = createServer((req, res) => {
//         handler(req, res);
//     });

//     const io = new Server(httpServer, {
//         cors: {
//             origin: "*",
//             methods: ["GET", "POST"],
//         },
//     });

//     io.on("connection", (socket) => {
//         console.log("⚡ User Connected:", socket.id);

//         // Receive Offer → Send to other peer
//         socket.on("offer", (data) => {
//             socket.broadcast.emit("offer", data);
//         });

//         // Receive Answer → Send to other peer
//         socket.on("answer", (data) => {
//             socket.broadcast.emit("answer", data);
//         });

//         // ICE Candidate
//         socket.on("candidate", (candidate) => {
//             socket.broadcast.emit("candidate", candidate);
//         });
//     });

//     const PORT = 3000;

//     httpServer.listen(PORT, () => {
//         console.log("🚀 Server running on http://localhost:" + PORT);
//     });
// });












let users = {}; // { socketId: name }

io.on("connection", (socket) => {
    console.log("⚡ User Joined:", socket.id);

    socket.on("register", (name) => {
        users[socket.id] = name;
        io.emit("users", users); // send updated list to all
    });

    socket.on("call-user", ({ targetId, offer }) => {
        io.to(targetId).emit("offer", {
            from: socket.id,
            offer,
            name: users[socket.id]
        });
    });

    socket.on("answer-user", ({ targetId, answer }) => {
        io.to(targetId).emit("answer", {
            from: socket.id,
            answer
        });
    });

    socket.on("candidate", ({ targetId, candidate }) => {
        io.to(targetId).emit("candidate", candidate);
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("users", users);
    });
});
