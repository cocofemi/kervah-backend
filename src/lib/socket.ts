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

  io.on("connection", (socket:any) => {
    const userId = socket.handshake.auth?.userId;
    if (userId) socket.join(userId.toString());

    console.log("🔌 Client connected:", userId);
  });

  return io;
}

export function getIO() {
  return io;
}
