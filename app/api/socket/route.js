// app/api/socket/route.js

import { Server } from "socket.io";

let io;

export const GET = async () => {
  if (io) return new Response("Running", { status: 200 });

  // Vercel ke liye special trick
  const dummyServer = {
    callbacks: {},
    on: (event, callback) => (dummyServer.callbacks[event] = callback),
    listen: () => dummyServer,
    close: () => { },
  };

  io = new Server(dummyServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: { origin: "*" },
  });

  const users = {};

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register", (name) => {
      users[socket.id] = name;
      io.emit("users", users);
      console.log(name + " registered");
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
      const targetId = Object.keys(users).find(id => users[id] === to);
      const msg = { text, from, to, timestamp: Date.now() };
      if (targetId) io.to(targetId).emit("chat-message", msg);
      socket.emit("chat-message", msg);
    });

    socket.on("disconnect", () => {
      delete users[socket.id];
      io.emit("users", users);
      console.log("User disconnected:", socket.id);
    });
  });

  global.io = io;

  return new Response("Socket server started", { status: 200 });
};

export const dynamic = "force-dynamic";