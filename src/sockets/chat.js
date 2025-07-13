const connectedUsers = new Map();

export default function handleChatEvents(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User joins a room (private chat or group chat)
    socket.on('joinRoom', ({ userId, roomId }) => {
      socket.join(roomId || userId);
      connectedUsers.set(socket.id, { userId, roomId });
      console.log(`User ${userId} joined room: ${roomId || userId}`);

      // Notify others in the room (except self)
      socket.to(roomId || userId).emit('userConnected', { userId });
    });

    // Real-time message handling
    socket.on('sendMessage', ({ senderId, recipientId, content, roomId }) => {
      const message = {
        senderId,
        recipientId,
        content,
        sentAt: new Date().toISOString(),
      };

      // Send to specific room (private or group)
      io.to(roomId || recipientId).emit('receiveMessage', message);
    });

    // Typing indicator
    socket.on('userTyping', ({ roomId, userId }) => {
      socket.to(roomId).emit('userTyping', { userId });
    });

    // Typing stop indicator
    socket.on('userStoppedTyping', ({ roomId, userId }) => {
      socket.to(roomId).emit('userStoppedTyping', { userId });
    });

    // Disconnection handling
    socket.on('disconnect', () => {
      const userData = connectedUsers.get(socket.id);
      if (userData) {
        const { userId, roomId } = userData;
        console.log(`User ${userId} disconnected from room ${roomId || userId}`);
        socket.to(roomId || userId).emit('userDisconnected', { userId });
        connectedUsers.delete(socket.id);
      } else {
        console.log(`Socket ${socket.id} disconnected`);
      }
    });
  });
}
