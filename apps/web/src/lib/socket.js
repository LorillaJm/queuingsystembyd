import { io } from 'socket.io-client';

let socket;

// Determine socket URL based on environment
const getSocketUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3001';
  
  // Use environment variable if available
  if (import.meta.env.PUBLIC_SOCKET_URL) {
    return import.meta.env.PUBLIC_SOCKET_URL;
  }
  
  // In development, use localhost
  return 'http://localhost:3001';
};

export function getSocket() {
  if (!socket) {
    socket = io(getSocketUrl(), {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
  }
  return socket;
}
