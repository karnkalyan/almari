const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSelect = { id: true, name: true, email: true, avatar: true };

const looksLikeEmail = (value) => typeof value === 'string' && /\S+@\S+\.\S+/.test(value);

const resolveConversationUserId = async ({ userId, guestName, guestEmail, phone }) => {
  if (userId) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (existingUser) return existingUser.id;
  }

  if (!guestEmail) return null;

  const existingGuest = await prisma.user.findUnique({
    where: { email: guestEmail },
    select: { id: true },
  });
  if (existingGuest) return existingGuest.id;

  const password = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);
  const guest = await prisma.user.create({
    data: {
      name: guestName || guestEmail.split('@')[0],
      email: guestEmail,
      phone,
      password,
      role: 'customer',
    },
    select: { id: true },
  });

  return guest.id;
};

const getConversations = async (req, res) => {
  try {
    const userId = req.query.userId;
    const where = {
      ...(userId ? { userId } : {}),
      user: { id: { not: '' } },
    };
    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        user: { select: userSelect },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(conversations);
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
    let { userId, subject, guestName, guestEmail, name, email, phone } = req.body;

    // Older chat clients accidentally sent (subject, email) as (userId, subject).
    if (!guestEmail && !email && looksLikeEmail(subject) && userId) {
      guestEmail = subject;
      subject = userId;
      userId = undefined;
    }

    const resolvedUserId = await resolveConversationUserId({
      userId,
      guestName: guestName || name,
      guestEmail: guestEmail || email,
      phone,
    });

    if (!resolvedUserId) {
      return res.status(400).json({ message: 'A valid userId or guestEmail is required to create a conversation' });
    }

    const conversation = await prisma.conversation.create({
      data: { userId: resolvedUserId, subject: subject || 'General Inquiry', status: 'open' },
      include: {
        user: { select: userSelect },
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
        user: { select: userSelect },
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
