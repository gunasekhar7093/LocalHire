const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, getConversations, getUnreadTotal, markAsRead, deleteConversation, getOrCreateConversation } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/unread-total', protect, getUnreadTotal);
router.put('/conversation/:id/delete', protect, deleteConversation);
router.put('/read/:id', protect, markAsRead); // id is conversationId
router.get('/conversations', protect, getConversations);
router.get('/:id', protect, getMessages); // id is conversationId
router.post('/conversation/get-or-create/:id', protect, getOrCreateConversation); // id is receiverId
router.post('/:id', protect, sendMessage); // id is receiverId

module.exports = router;
