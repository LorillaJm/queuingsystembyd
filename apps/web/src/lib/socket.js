import { io } from 'socket.io-client';
import { PUBLIC_SOCKET_URL } from '$env/static/public';

let socket;

// Determine socket URL based on environment
const getSocketUrl = () => {
  // Always use the environment variable from SvelteKit
  return PUBLIC_SOCKET_URL || 'https://queuingsystembyd.onrender.com';
};

export function getSocket() {
  if (!socket) {
    const socketUrl = getSocketUrl();
    console.log('Connecting to socket:', socketUrl);
    
    socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
  }
  return socket;
}
