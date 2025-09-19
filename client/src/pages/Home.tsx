import { useCallback, useEffect, useState } from "react";
import Button from "../components/Button";
import { useWebSocket } from "../context/WebSocketContext";
import toast from "react-hot-toast";
import type { IMessageFromServer } from "../Types/customTypes";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

export default function Home() {
  const { ws, ready } = useWebSocket();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [roomData, setRoomData] = useState<{ roomId: string; name: string }>({
    roomId: "",
    name: "",
  });

  const handleCreateRoom = useCallback((ws: WebSocket) => {
    if (!ws) return;
    ws.send(JSON.stringify({ type: "createRoom" }));
  }, []);

  const handleClickText = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Copied to clipboard");
  };

  const handleJoinRoom = () => {
    navigate(`/chat?name=${roomData.name}&roomId=${roomData.roomId}`);
  };

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      const msg: IMessageFromServer = JSON.parse(event.data);

      if (msg.type === "roomCreated") {
        setRoomId(msg.roomId!);
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => ws.removeEventListener("message", handleMessage);
  }, [ws]);

  if (!ready)
    return (
      <div className="flex flex-col h-screen w-full justify-center items-center">
        <Spinner size={60} />
        <p className="font-semibold text-gray-600">
          Please wait while the server is starting (around 50s)...
        </p>
      </div>
    );

  return (
    <div className="flex justify-center items-center h-screen w-full ">
      <div className="flex flex-col w-full md:w-2/4 rounded-lg shadow border border-gray-200  p-10 space-y-4 md:space-y-3 ">
        <div>
          <h1 className="text-3xl font-bold tracking-wider">Simple Chat App</h1>
          <p className="text-gray-500 text-lg md:text-base">
            A real time chat application
          </p>
        </div>
        <Button
          className="py-3"
          onClick={() => handleCreateRoom(ws!)}
          disabled={!ready}
        >
          Create New Room
        </Button>
        {roomId !== "" && (
          <div className="flex justify-between items-center bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg text-gray-700">
            <span className="font-mono text-sm">{roomId}</span>
            <Button
              variant="secondary"
              className="text-sm"
              onClick={handleClickText}
            >
              Copy
            </Button>
          </div>
        )}
        <input
          type="text"
          className="border border-gray-300 rounded-md p-2"
          placeholder="Enter your name"
          value={roomData.name}
          onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
        />
        <div className="flex justify-between gap-3">
          <input
            type="text"
            className="border border-gray-300 rounded-md p-2 flex-1"
            placeholder="Enter room code"
            value={roomData.roomId}
            onChange={(e) =>
              setRoomData({ ...roomData, roomId: e.target.value })
            }
          />
          <Button onClick={handleJoinRoom}>Join Room</Button>
        </div>
      </div>
    </div>
  );
}
