import prisma from '../config/db.js';

/**
 * @desc Send a message from sender to recipient
 */
export const sendMessage = async (req, res) => {
  try {
    const { senderId, recipientId, content } = req.body || {};

    if (!senderId || !recipientId || !content) {
      return res.status(400).json({ message: 'senderId, recipientId, and content are required' });
    }

    // Create message in DB
    const message = await prisma.message.create({
      data: {
        senderId: parseInt(senderId),
        receiverId: parseInt(recipientId),
        content,
      },
    });

    res.status(201).json({ message });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc Get all messages between two users
 */
export const getMessages = async (req, res) => {
  try {
    const { senderId, recipientId } = req.query || {};

    if (!senderId || !recipientId) {
      return res.status(400).json({ message: 'senderId and recipientId are required' });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: parseInt(senderId), receiverId: parseInt(recipientId) },
          { senderId: parseInt(recipientId), receiverId: parseInt(senderId) },
        ],
      },
      orderBy: {
        sentAt: 'asc',
      },
    });

    res.status(200).json({ messages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
