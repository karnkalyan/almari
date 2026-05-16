const prisma = require('../prismaClient');

const slugify = (value = '') => String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const getFlags = async (req, res) => {
  try {
    const flags = await prisma.productFlag.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        products: {
          include: {
            product: { include: { category: true } },
          },
        },
      },
    });
    res.json(flags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createFlag = async (req, res) => {
  try {
    const { name, color, isActive = true } = req.body;
    const flag = await prisma.productFlag.create({
      data: {
        name,
        slug: slugify(name),
        color: color || null,
        isActive: Boolean(isActive),
      },
    });
    res.status(201).json(flag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateFlag = async (req, res) => {
  try {
    const { name, color, isActive } = req.body;
    const flag = await prisma.productFlag.update({
      where: { id: req.params.id },
      data: {
        name: name || undefined,
        slug: name ? slugify(name) : undefined,
        color: color == null ? undefined : color,
        isActive: isActive == null ? undefined : Boolean(isActive),
      },
    });
    res.json(flag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteFlag = async (req, res) => {
  try {
    await prisma.productFlag.delete({ where: { id: req.params.id } });
    res.json({ message: 'Flag deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const setFlagProducts = async (req, res) => {
  try {
    const { productIds = [] } = req.body;
    const flagId = req.params.id;
    await prisma.productFlagAssignment.deleteMany({ where: { flagId } });
    if (productIds.length) {
      await prisma.productFlagAssignment.createMany({
        data: productIds.map((productId) => ({ flagId, productId })),
        skipDuplicates: true,
      });
    }
    const updated = await prisma.productFlag.findUnique({
      where: { id: flagId },
      include: {
        products: {
          include: {
            product: { include: { category: true } },
          },
        },
      },
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getFlags, createFlag, updateFlag, deleteFlag, setFlagProducts };
