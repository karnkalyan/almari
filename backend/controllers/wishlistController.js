const prisma = require('../prismaClient');

const getUserId = (req) => req.userId || req.query.userId || req.body.userId;

const getWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.json([]);
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: { include: { category: true, brandRef: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addWishlistItem = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    const item = await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
      include: { product: true },
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteWishlistItem = async (req, res) => {
  try {
    await prisma.wishlistItem.delete({ where: { id: req.params.id } });
    res.json({ message: 'Wishlist item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWishlist, addWishlistItem, deleteWishlistItem };
