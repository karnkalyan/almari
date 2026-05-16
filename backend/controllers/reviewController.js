const prisma = require('../prismaClient');

const refreshProductRating = async (productId) => {
  const reviews = await prisma.review.findMany({ where: { productId, status: 'approved' } });
  const count = reviews.length;
  const rating = count ? reviews.reduce((sum, review) => sum + review.rating, 0) / count : 0;
  await prisma.product.update({ where: { id: productId }, data: { rating, reviews: count } });
};

const getReviews = async (req, res) => {
  try {
    const where = req.query.productId ? { productId: req.query.productId } : {};
    const reviews = await prisma.review.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } }, product: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const { productId, userId, rating, title, comment } = req.body;
    const review = await prisma.review.upsert({
      where: { productId_userId: { productId, userId } },
      update: { rating: parseInt(rating), title, comment, status: 'pending' },
      create: { productId, userId, rating: parseInt(rating), title, comment, status: 'pending' },
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const { status, rating, title, comment } = req.body;
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { status, rating: rating ? parseInt(rating) : undefined, title, comment },
    });
    await refreshProductRating(review.productId);
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await prisma.review.delete({ where: { id: req.params.id } });
    await refreshProductRating(review.productId);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getReviews, createReview, updateReview, deleteReview };
