import express from 'express';
import { sendMessage, getMessages } from '../controllers/messageController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// @route   POST /api/messages
// @desc    Send a message (requires auth)
// @access  Private
router.post('/messages', authenticate, sendMessage);

// @route   GET /api/messages
// @desc    Get all messages with sender info (requires auth)
// @access  Private
router.get('/messages', authenticate, getMessages);

export default router;
