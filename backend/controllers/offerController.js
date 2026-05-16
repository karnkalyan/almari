const prisma = require('../prismaClient');

const getOffers = async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOffer = async (req, res) => {
  try {
    const offer = await prisma.offer.findUnique({
      where: { id: req.params.id },
    });
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOffer = async (req, res) => {
  try {
    const { title, description, discountType, discountValue, applicableCategories, applicableProducts, startsAt, endsAt } = req.body;
    const offer = await prisma.offer.create({
      data: {
        title,
        description,
        discountType,
        discountValue: parseFloat(discountValue),
        applicableCategories: applicableCategories || [],
        applicableProducts: applicableProducts || [],
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
      },
    });
    res.status(201).json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateOffer = async (req, res) => {
  try {
    const { title, description, discountType, discountValue, applicableCategories, applicableProducts, isActive, startsAt, endsAt } = req.body;
    const offer = await prisma.offer.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        discountType,
        discountValue: parseFloat(discountValue),
        applicableCategories: applicableCategories || [],
        applicableProducts: applicableProducts || [],
        isActive,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
      },
    });
    res.json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteOffer = async (req, res) => {
  try {
    await prisma.offer.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Offer deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
};
