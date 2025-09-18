import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const WebSocketContext = createContext<{
  ws: WebSocket | null;
  ready: boolean;
}>({ ws: null, ready: false });

export default function WebSocketProvider({
  children,
}: {
  children: ReactNode;
}) {
  const wsRef = useRef<WebSocket | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let ws: WebSocket;
    function connect() {
      // https://simple-chat-app-p8ta.onrender.com
      ws = new WebSocket(
        import.meta.env.PROD
          ? "wss://simple-chat-app-p8ta.onrender.com"
          : "ws://localhost:8000"
      );
      wsRef.current = ws;

      ws.onopen = () => {
        setReady(true);
        console.log("✅ Connected");
      };

      ws.onclose = () => {
        setReady(false);
        console.log("❌ Disconnected, retrying in 2s...");
        setTimeout(connect, 2000);
      };
    }

    connect();

    return () => ws.close();
  }, []);

  if (!ready) return null;

  return (
    <WebSocketContext.Provider value={{ ws: wsRef.current, ready }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error("Can't use outside websocket provider");
  return context;
}
