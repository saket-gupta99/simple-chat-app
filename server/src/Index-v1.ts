import WebSocket, { WebSocketServer } from "ws";
import { v4 as uuid4 } from "uuid";
import { URL } from "url";
import express from "express";
import { createServer } from "http";

const app = express();
app.use(express.json());

const server = createServer(app);

const wss = new WebSocketServer({ server });

const users = new Map<string, Set<WebSocket>>();

const handleMessage = (data: WebSocket.RawData, ws: WebSocket) => {
  const message = data.toString();
  users.get(ws.roomId)?.forEach((user) => {
    if (ws.id !== user.id) user.send(`${ws.name} : ${message}`);
  });
};

wss.on("connection", (ws, req) => {
  console.log("A new connection added");
  const parsed = new URL(req.url ?? "", `http://${req.headers.host}`);
  const name = parsed.searchParams.get("name");
  const roomId = parsed.searchParams.get("roomId");
  if (!name || !roomId) {
    ws.close();
    return;
  }

  const uuid = uuid4();
  ws.id = uuid;
  ws.name = name;
  ws.roomId = roomId;

  if (!users.get(roomId)) users.set(roomId, new Set());
  users.get(roomId)!.add(ws);

  ws.on("message", (data) => handleMessage(data, ws));
  ws.on("close", () => {
    users.get(roomId)?.delete(ws);
    users.get(roomId)?.forEach((user) => {
      user.send(`${name} left the chat.`);
    });
    console.log(`${name} disconnected`);
  });

  users.get(roomId)?.forEach((user) => {
    if (user !== ws) user.send(`${name} joined the chat`);
  });
});

server.listen(8000, () => {
  console.log("Server is running on port 8000");
});
