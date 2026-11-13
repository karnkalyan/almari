const prisma = require('../prismaClient');

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { parent: true, children: true },
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, parentId, image } = req.body;
    const trimmedName = String(name || '').trim();
    if (!trimmedName) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        description: description || null,
        parentId: parentId || null,
        image: image || null,
      },
    });
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'A category with this name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parentId, image } = req.body;
    const data = {};

    if (name !== undefined) {
      const trimmedName = String(name || '').trim();
      if (!trimmedName) {
        return res.status(400).json({ message: 'Category name cannot be empty' });
      }
      data.name = trimmedName;
    }
    if (description !== undefined) data.description = description || null;
    if (image !== undefined) data.image = image || null;
    if (parentId !== undefined) {
      if (parentId === id) {
        return res.status(400).json({ message: 'A category cannot be its own parent' });
      }
      data.parentId = parentId || null;
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });
    res.json(category);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Category not found' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'A category with this name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.$transaction(async (tx) => {
      // Detach any child subcategories so self-referencing FK never blocks deletion
      await tx.category.updateMany({
        where: { parentId: id },
        data: { parentId: null },
      });

      // Find all products in this category
      const products = await tx.product.findMany({
        where: { categoryId: id },
        select: { id: true },
      });
      const productIds = products.map(p => p.id);

      if (productIds.length > 0) {
        // Delete dependent records for all products in this category
        await tx.orderItem.deleteMany({ where: { productId: { in: productIds } } });
        await tx.cartItem.deleteMany({ where: { productId: { in: productIds } } });
        await tx.wishlistItem.deleteMany({ where: { productId: { in: productIds } } });
        await tx.review.deleteMany({ where: { productId: { in: productIds } } });
        await tx.productFlagAssignment.deleteMany({ where: { productId: { in: productIds } } });
        await tx.flashSaleProduct.deleteMany({ where: { productId: { in: productIds } } });

        // Delete the products in this category
        await tx.product.deleteMany({ where: { categoryId: id } });
      }

      // Finally delete the category
      await tx.category.delete({ where: { id } });
    });
    res.json({ message: 'Category and all associated products deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
