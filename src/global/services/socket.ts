import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (url: string): Socket => {
  if (!socket) {
    socket = io(url, {
      path: "/ws-stomp",
      transports: ["websocket"],
    });
  }
  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
