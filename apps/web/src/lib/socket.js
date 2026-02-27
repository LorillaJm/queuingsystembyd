import { io } from 'socket.io-client';

let socket;

// Determine socket URL based on environment
const getSocketUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3001';
  
  // In production, use the same host as the web app
  if (window.location.hostname !== 'localhost') {
    return `${window.location.protocol}//${window.location.hostname}`;
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
