const prisma = require('../prismaClient');

const getFlashSales = async (req, res) => {
  try {
    const flashSales = await prisma.flashSale.findMany({
      where: { isActive: true },
      include: { products: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(flashSales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFlashSale = async (req, res) => {
  try {
    const flashSale = await prisma.flashSale.findUnique({
      where: { id: req.params.id },
      include: { products: { include: { product: true } } },
    });
    if (!flashSale) return res.status(404).json({ message: 'Flash sale not found' });
    res.json(flashSale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createFlashSale = async (req, res) => {
  try {
    const { title, description, discountPercentage, startsAt, endsAt, products } = req.body;
    const flashSale = await prisma.flashSale.create({
      data: {
        title,
        description,
        discountPercentage: parseFloat(discountPercentage),
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        products: {
          create: products.map(p => ({
            productId: p.productId,
            originalPrice: p.originalPrice,
            salePrice: p.salePrice,
          })),
        },
      },
      include: { products: { include: { product: true } } },
    });
    res.status(201).json(flashSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateFlashSale = async (req, res) => {
  try {
    const { title, description, discountPercentage, isActive, startsAt, endsAt, products } = req.body;
    const flashSale = await prisma.flashSale.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        discountPercentage: parseFloat(discountPercentage),
        isActive,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        products: {
          deleteMany: {},
          create: products.map(p => ({
            productId: p.productId,
            originalPrice: p.originalPrice,
            salePrice: p.salePrice,
          })),
        },
      },
      include: { products: { include: { product: true } } },
    });
    res.json(flashSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteFlashSale = async (req, res) => {
  try {
    await prisma.flashSale.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Flash sale deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFlashSales,
  getFlashSale,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
};
