import { Server } from 'socket.io';
import handleChatEvents from '../sockets/chat.js';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Delegate chat event handling
  handleChatEvents(io);

  return io;
}

export { io };
