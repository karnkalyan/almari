const prisma = require('../prismaClient');

const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const where = {};
    if (category) {
      where.category = { name: category };
    }
    if (search) {
      const tokens = String(search)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

      if (tokens.length > 0) {
        where.AND = tokens.map(token => ({
          OR: [
            { name: { contains: token } },
            { description: { contains: token } },
            { brand: { contains: token } },
          ],
        }));
      }
    }
    const products = await prisma.product.findMany({
      where,
      include: { category: true, brandRef: true, customFlags: { include: { flag: true } } },
      skip,
      take: parseInt(limit),
    });
    const total = await prisma.product.count({ where });
    res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { 
        category: { include: { parent: true } }, 
        brandRef: true, 
        reviewItems: { 
          where: { status: 'approved' }, 
          include: { user: { select: { id: true, name: true } } }, 
          orderBy: { createdAt: 'desc' } 
        },
        customFlags: { include: { flag: true } }
      },
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { flagIds, ...data } = req.body;
    // Ensure numeric fields are parsed
    if (data.price) data.price = parseFloat(data.price);
    if (data.originalPrice) data.originalPrice = parseFloat(data.originalPrice);
    if (data.discount) data.discount = parseFloat(data.discount);
    
    const product = await prisma.product.create({
      data: {
        ...data,
        customFlags: flagIds ? {
          create: flagIds.map(flagId => ({ flagId }))
        } : undefined
      },
      include: { category: true, brandRef: true, customFlags: { include: { flag: true } } },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { flagIds, ...data } = req.body;
    // Ensure numeric fields are parsed
    if (data.price) data.price = parseFloat(data.price);
    if (data.originalPrice) data.originalPrice = parseFloat(data.originalPrice);
    if (data.discount) data.discount = parseFloat(data.discount);

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...data,
        customFlags: flagIds ? {
          deleteMany: {},
          create: flagIds.map(flagId => ({ flagId }))
        } : undefined
      },
      include: { category: true, brandRef: true, customFlags: { include: { flag: true } } },
    });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
