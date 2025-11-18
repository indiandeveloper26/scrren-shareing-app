// app/api/socket/io/route.js   ← yeh path hona chahiye

import { Server } from "socket.io";

let io;

export const GET = async (request) => {
  if (!io) {
    // Next.js ke real server ko access karne ka sahi tarika
    const { server: httpServer } = await import("node:http");

    // Global variable mein store karo taaki baar-baar na bane
    if (!global.ioServer) {
      const server = httpServer.createServer();
      io = new Server(server, {
        path: "/api/socket/io",
        addTrailingSlash: false,
        cors: { origin: "*" },
      });

      const users = {};

      io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("register", (name) => {
          users[socket.id] = name;
          console.log(name, "registered");
          io.emit("users", users);
        });

        socket.on("call-user", (data) => socket.to(data.targetId).emit("offer", { from: socket.id, offer: data.offer }));
        socket.on("answer-user", (data) => socket.to(data.targetId).emit("answer", { answer: data.answer }));
        socket.on("candidate", (data) => socket.to(data.targetId).emit("candidate", data.candidate));

        socket.on("disconnect", () => {
          delete users[socket.id];
          io.emit("users", users);
          console.log("User disconnected");
        });
      });

      global.ioServer = server;
      global.io = io;
    }

    io = global.io;
  }

  return new Response("Socket.io ready", { status: 200 });
};

export const dynamic = "force-dynamic";