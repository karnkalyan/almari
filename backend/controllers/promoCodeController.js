const prisma = require('../prismaClient');

const getPromoCodes = async (req, res) => {
  try {
    const promoCodes = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(promoCodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPromoCode = async (req, res) => {
  try {
    const promoCode = await prisma.promoCode.findUnique({
      where: { id: req.params.id },
    });
    if (!promoCode) return res.status(404).json({ message: 'Promo code not found' });
    res.json(promoCode);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPromoCode = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, expiresAt, usageLimit } = req.body;
    const promoCode = await prisma.promoCode.create({
      data: {
        code,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
      },
    });
    res.status(201).json(promoCode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updatePromoCode = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, isActive, expiresAt, usageLimit } = req.body;
    const promoCode = await prisma.promoCode.update({
      where: { id: req.params.id },
      data: {
        code,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
      },
    });
    res.json(promoCode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deletePromoCode = async (req, res) => {
  try {
    await prisma.promoCode.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Promo code deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const validatePromoCode = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const promoCode = await prisma.promoCode.findUnique({
      where: { code },
    });
    if (!promoCode) return res.status(404).json({ message: 'Invalid promo code' });
    if (!promoCode.isActive) return res.status(400).json({ message: 'Promo code is inactive' });
    if (promoCode.expiresAt && new Date() > promoCode.expiresAt) return res.status(400).json({ message: 'Promo code has expired' });
    if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) return res.status(400).json({ message: 'Promo code usage limit exceeded' });
    if (promoCode.minOrderValue && orderTotal < promoCode.minOrderValue) return res.status(400).json({ message: 'Minimum order value not met' });

    let discount = 0;
    if (promoCode.discountType === 'percentage') {
      discount = (orderTotal * promoCode.discountValue) / 100;
      if (promoCode.maxDiscount && discount > promoCode.maxDiscount) {
        discount = promoCode.maxDiscount;
      }
    } else {
      discount = promoCode.discountValue;
    }

    res.json({ promoCode, discount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPromoCodes,
  getPromoCode,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  validatePromoCode,
};
