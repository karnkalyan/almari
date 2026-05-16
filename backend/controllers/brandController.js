const prisma = require('../prismaClient');

const slugify = (value) => String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const getBrands = async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBrand = async (req, res) => {
  try {
    const { name, logo, description, isActive = true } = req.body;
    const brand = await prisma.brand.create({
      data: { name, slug: slugify(name), logo, description, isActive },
    });
    res.status(201).json(brand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateBrand = async (req, res) => {
  try {
    const { name, logo, description, isActive } = req.body;
    const brand = await prisma.brand.update({
      where: { id: req.params.id },
      data: { name, slug: name ? slugify(name) : undefined, logo, description, isActive },
    });
    res.json(brand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteBrand = async (req, res) => {
  try {
    await prisma.brand.delete({ where: { id: req.params.id } });
    res.json({ message: 'Brand deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBrands, createBrand, updateBrand, deleteBrand };
