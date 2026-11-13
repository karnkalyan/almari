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
    const trimmedName = String(name || '').trim();
    if (!trimmedName) {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    let slug = slugify(trimmedName) || `brand-${Date.now()}`;
    const existingSlug = await prisma.brand.findUnique({ where: { slug } });
    if (existingSlug) {
      if (existingSlug.name.toLowerCase() === trimmedName.toLowerCase()) {
        return res.status(400).json({ message: 'A brand with this name already exists' });
      }
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const brand = await prisma.brand.create({
      data: {
        name: trimmedName,
        slug,
        logo: logo || null,
        description: description || null,
        isActive: isActive !== false,
      },
    });
    res.status(201).json(brand);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'A brand with this name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

const updateBrand = async (req, res) => {
  try {
    const { name, logo, description, isActive } = req.body;
    const data = {};

    if (name !== undefined) {
      const trimmedName = String(name || '').trim();
      if (!trimmedName) {
        return res.status(400).json({ message: 'Brand name cannot be empty' });
      }
      data.name = trimmedName;
      let slug = slugify(trimmedName) || `brand-${Date.now()}`;
      const existingSlug = await prisma.brand.findUnique({ where: { slug } });
      if (existingSlug && existingSlug.id !== req.params.id) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
      data.slug = slug;
    }
    if (logo !== undefined) data.logo = logo || null;
    if (description !== undefined) data.description = description || null;
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const brand = await prisma.brand.update({
      where: { id: req.params.id },
      data,
    });
    res.json(brand);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Brand not found' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'A brand with this name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.$transaction(async (tx) => {
      // Disassociate products referencing this brand so product data is not broken
      await tx.product.updateMany({
        where: { brandId: id },
        data: { brandId: null },
      });

      // Delete the brand
      await tx.brand.delete({ where: { id } });
    });
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBrands, createBrand, updateBrand, deleteBrand };
