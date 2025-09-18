import { createServer } from "http";
import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import { randomBytes } from "crypto";
import { v4 as uuidv4 } from "uuid";
import type { IMessageFromClient } from "./types/customTypes.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const rooms = new Map<string, Set<WebSocket>>();

wss.on("connection", (ws: WebSocket) => {
  console.log("New connection added");

  ws.on("message", (raw) => {
    let msg: IMessageFromClient;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      ws.send(JSON.stringify({ type: "error", message: "Invalid json" }));
      return;
    }

    switch (msg.type) {
      case "createRoom": {
        const roomId = randomBytes(3).toString("hex").toUpperCase();
        rooms.set(roomId, new Set());
        ws.send(JSON.stringify({ type: "roomCreated", roomId }));
        console.log(`Room created: ${roomId}`);
        break;
      }

      case "joinRoom": {
        const room = rooms.get(msg.roomId!);
        if (!room) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "No room with this id exists",
            })
          );
          return;
        }

        ws.id = uuidv4();
        ws.name = msg.name!;
        ws.roomId = msg.roomId!;

        room.add(ws);
        ws.send(
          JSON.stringify({
            type: "roomJoined",
            roomId: msg.roomId,
            name: ws.name,
          })
        );

        room.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "userJoinedRoom",
                text: `${msg.name} joined the room`,
                roomId: msg.roomId,
              })
            );
          }
        });

        console.log(`${msg.name} joined room ${msg.roomId}`);
        break;
      }

      case "message": {
        if (!msg.roomId || !rooms.get(msg.roomId)) return;
        rooms.get(msg.roomId)?.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && client !== ws) {
            client.send(
              JSON.stringify({
                type: "message",
                text: msg.text,
                roomId: msg.roomId,
                name: ws.name,
              })
            );
          }
        });
        break;
      }

      default:
        ws.send(JSON.stringify({ type: "error", message: "Unknown event" }));
    }
  });

  ws.on("close", () => {
    const room = rooms.get(ws.roomId);
    room?.delete(ws);

    room?.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "UserLeftmessage",
            text: `${ws.name} left the room`,
            roomId: ws.roomId,
          })
        );
      }
    });

    if (room?.size === 0) {
      rooms.delete(ws.roomId);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
