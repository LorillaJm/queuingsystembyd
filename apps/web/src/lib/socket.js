import { io } from 'socket.io-client';
import { PUBLIC_SOCKET_URL } from '$env/static/public';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
  }
  return socket;
}
