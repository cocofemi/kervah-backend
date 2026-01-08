// lib/socket.ts

import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";

let io:any = null;

export function initSocket(httpServer:HTTPServer ) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // io.on("connection", (socket:any) => {
  //   const userId = socket.handshake.auth?.userId;
  //   if (userId) socket.join(userId.toString());

  //   console.log("🔌 Client connected:", userId);
  // });

  const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  // User joins with their userId
  socket.on("register", (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} registered to socket ${socket.id}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    for (let [userId, id] of connectedUsers.entries()) {
      if (id === socket.id) {
        connectedUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
      }
    }
  });
});

  return io;
}



export function getIO() {
  return io;
}
