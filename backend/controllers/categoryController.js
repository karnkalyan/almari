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
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
