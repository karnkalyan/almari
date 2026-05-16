const prisma = require('../prismaClient');

const getConversations = async (req, res) => {
  try {
    const userId = req.query.userId;
    const where = userId ? { userId } : {};
    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
    // Filter out orphaned conversations if any (though onDelete: Cascade should prevent this)
    const validConversations = conversations.filter(c => c.user !== null);
    res.json(validConversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
    // Mark unread admin messages as read when admin fetches
    if (req.query.markRead === 'admin') {
      await prisma.chatMessage.updateMany({
        where: { conversationId, sender: 'customer', isRead: false },
        data: { isRead: true },
      });
    }
    // Mark unread customer messages as read when customer fetches
    if (req.query.markRead === 'customer') {
      await prisma.chatMessage.updateMany({
        where: { conversationId, sender: 'admin', isRead: false },
        data: { isRead: true },
      });
    }
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createConversation = async (req, res) => {
  try {
    const { userId, subject } = req.body;
    const conversation = await prisma.conversation.create({
      data: { userId, subject: subject || 'General Inquiry', status: 'open' },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        messages: true,
      },
    });
    res.status(201).json(conversation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, sender } = req.body;
    const message = await prisma.chatMessage.create({
      data: { conversationId, text, sender: sender || 'customer', isRead: false },
    });
    // Update conversation timestamp and status
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date(), status: 'open' },
    });
    // Emit via socket if available
    if (req.app.get('io')) {
      req.app.get('io').emit('new_message', { conversationId, message });
    }
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateConversationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const conversation = await prisma.conversation.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    res.json(conversation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteConversation = async (req, res) => {
  try {
    await prisma.conversation.delete({ where: { id: req.params.id } });
    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getConversations, getMessages, createConversation, sendMessage, updateConversationStatus, deleteConversation };
