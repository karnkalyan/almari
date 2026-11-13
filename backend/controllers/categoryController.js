const prisma = require('../prismaClient');

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ include: { parent: true, children: true }, orderBy: [{ parentId: 'asc' }, { name: 'asc' }] });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, parentId, image } = req.body;
    const category = await prisma.category.create({ data: { name, description, parentId: parentId || null, image } });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description, parentId, image } = req.body;
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name, description, parentId: parentId || null, image },
    });
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.$transaction(async (tx) => {
      // Find all products in this category
      const products = await tx.product.findMany({
        where: { categoryId: id },
        select: { id: true }
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
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
