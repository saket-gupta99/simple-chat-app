import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import WebSocketProvider from "./context/WebSocketContext";
import { Toaster } from "react-hot-toast";
import Chat from "./pages/Chat";

export default function App() {
  return (
    <>
      <WebSocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/home" element={<Navigate replace to="/" />} />
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </BrowserRouter>
      </WebSocketProvider>
      <Toaster />
    </>
  );
}
