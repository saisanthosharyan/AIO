import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (socket && socket.auth && typeof socket.auth === "object") {
    if ((socket.auth as { token?: string }).token !== token) {
      socket.disconnect();
      socket = null;
    }
  }

  if (!socket) {
    socket = io(
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000",
      {
        autoConnect: false,
        auth: { token },
        transports: ["websocket", "polling"],
      },
    );
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}