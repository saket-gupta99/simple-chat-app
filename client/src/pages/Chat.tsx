import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../context/WebSocketContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { IMessageFromServer } from "../Types/customTypes";
import toast from "react-hot-toast";
import Button from "../components/Button";

export default function Chat() {
  const { ws } = useWebSocket();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<(string | IMessageFromServer)[]>([]);

  const name = searchParams.get("name");
  const roomId = searchParams.get("roomId");

  const handleSendMessage = () => {
    if (!ws) return;
    if (!message.trim()) return;
    ws!.send(JSON.stringify({ type: "message", roomId, text: message }));
    setMessages((msg) => [...msg, message]);
    setMessage("");
  };

  useEffect(() => {
    if (!ws) return;

    ws.send(JSON.stringify({ type: "joinRoom", name, roomId }));
    const handleMessage = (event: MessageEvent) => {
      const msg: IMessageFromServer = JSON.parse(event.data);

      if (
        (msg.type === "message" ||
          msg.type === "UserLeftmessage" ||
          msg.type === "userJoinedRoom") &&
        msg.roomId === roomId
      ) {
        setMessages((msgs) => [...msgs, msg]);
      }
      if (msg.type === "error") {
        toast.error(msg.message!);
        navigate("/home");
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => ws.removeEventListener("message", handleMessage);
  }, [ws, name, roomId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full md:w-2/3 mx-auto h-screen flex flex-col bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg, id) =>
          typeof msg === "object" ? (
            msg.type === "UserLeftmessage" || msg.type === "userJoinedRoom" ? (
              <div key={id} className="flex justify-center">
                <p className="text-xs text-gray-500 italic bg-gray-100 px-3 py-1 rounded-full">
                  {msg.text}
                </p>
              </div>
            ) : (
              <div key={id} className="flex flex-col items-start">
                <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm max-w-xs">
                  <p className="text-gray-800">{msg.text}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{msg.name}</p>
              </div>
            )
          ) : (
            <div key={id} className="flex justify-end">
              <div className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow max-w-xs">
                {msg}
              </div>
            </div>
          )
        )}
        <div ref={messagesEndRef}></div>
      </div>

      <form
        className="p-3 border-t border-gray-200 bg-white flex items-center gap-2"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="text"
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <Button
          variant="secondary"
          type="submit"
          className="font-semibold rounded-lg px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition"
          onClick={handleSendMessage}
        >
          Send
        </Button>
      </form>
    </div>
  );
}
