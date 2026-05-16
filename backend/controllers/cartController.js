const prisma = require('../prismaClient');

const getUserId = (req) => req.userId || req.query.userId || req.body.userId;

const getCart = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.json([]);
    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: { include: { category: true, brandRef: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const upsertCartItem = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { productId, quantity = 1, selectedOptions } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    const item = await prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: { quantity: parseInt(quantity), selectedOptions },
      create: { userId, productId, quantity: parseInt(quantity), selectedOptions },
      include: { product: true },
    });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.id } });
    res.json({ message: 'Cart item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCart, upsertCartItem, deleteCartItem };
