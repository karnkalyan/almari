const express = require('express');
const router = express.Router();
const { getConversations, getMessages, createConversation, sendMessage, updateConversationStatus, deleteConversation } = require('../controllers/messageController');

router.get('/', getConversations);
router.post('/', createConversation);
router.get('/:conversationId/messages', getMessages);
router.post('/:conversationId/messages', sendMessage);
router.put('/:id/status', updateConversationStatus);
router.delete('/:id', deleteConversation);

module.exports = router;
