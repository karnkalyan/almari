const bcrypt = require('bcryptjs');
const prisma = require('../prismaClient');

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
        addresses: true,
        orders: { select: { id: true, total: true, status: true, date: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
        addresses: true,
        orders: { include: { address: true, items: { include: { product: true } } }, orderBy: { date: 'desc' } },
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const requesterRole = req.user?.role;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Only super_admin can create super_admin
    if (role === 'super_admin' && requesterRole !== 'super_admin') {
      return res.status(403).json({ message: 'Only super administrators can create super admin accounts' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: role || 'customer',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    const targetId = req.params.id;
    const requesterId = req.userId;

    const requesterUser = await prisma.user.findUnique({ where: { id: requesterId } });
    const isSelf = requesterId === targetId;
    const isAdmin = requesterUser && ['admin', 'super_admin'].includes(requesterUser.role);

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to update this user' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetId } });
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    // If target user is super_admin and requester is NOT super_admin
    if (targetUser.role === 'super_admin' && requesterUser?.role !== 'super_admin' && !isSelf) {
      return res.status(403).json({ message: 'Only super administrators can modify super admin accounts' });
    }

    // Role assignment rules: only admin/super_admin can change role, only super_admin can assign super_admin
    if (role && role !== targetUser.role) {
      if (!isAdmin) {
        return res.status(403).json({ message: 'Only administrators can change user roles' });
      }
      if (role === 'super_admin' && requesterUser?.role !== 'super_admin') {
        return res.status(403).json({ message: 'Only super administrators can assign the super admin role' });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined && isAdmin) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: targetId },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const requesterRole = req.user?.role;
    const targetId = req.params.id;

    const targetUser = await prisma.user.findUnique({ where: { id: targetId } });
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    // Super admin cannot have their role changed by regular admin
    if (targetUser.role === 'super_admin' && requesterRole !== 'super_admin') {
      return res.status(403).json({ message: 'Super admin role cannot be modified by administrators' });
    }

    // Only super_admin can assign super_admin role
    if (role === 'super_admin' && requesterRole !== 'super_admin') {
      return res.status(403).json({ message: 'Only super administrators can assign the super admin role' });
    }

    const user = await prisma.user.update({
      where: { id: targetId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const requesterId = req.userId;

    const targetUser = await prisma.user.findUnique({ where: { id: targetId } });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // CANNOT delete super_admin user under any circumstance!
    if (targetUser.role === 'super_admin') {
      return res.status(403).json({ message: 'Super admin users cannot be removed' });
    }

    if (requesterId === targetId) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Cascading cleanup in transaction
    await prisma.$transaction(async (tx) => {
      const userOrders = await tx.order.findMany({ where: { userId: targetId }, select: { id: true } });
      const orderIds = userOrders.map((o) => o.id);
      if (orderIds.length > 0) {
        await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
        await tx.order.deleteMany({ where: { id: { in: orderIds } } });
      }

      const userConversations = await tx.conversation.findMany({ where: { userId: targetId }, select: { id: true } });
      const conversationIds = userConversations.map((c) => c.id);
      if (conversationIds.length > 0) {
        await tx.chatMessage.deleteMany({ where: { conversationId: { in: conversationIds } } });
        await tx.conversation.deleteMany({ where: { id: { in: conversationIds } } });
      }

      await tx.review.deleteMany({ where: { userId: targetId } });
      await tx.cartItem.deleteMany({ where: { userId: targetId } });
      await tx.wishlistItem.deleteMany({ where: { userId: targetId } });
      await tx.address.deleteMany({ where: { userId: targetId } });

      await tx.user.delete({ where: { id: targetId } });
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, getUser, createUser, updateUser, updateUserRole, deleteUser };
