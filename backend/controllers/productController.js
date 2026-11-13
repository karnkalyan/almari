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

const PRODUCT_FIELDS = [
  'name', 'shortDescription', 'description', 'longDescription',
  'price', 'originalPrice', 'discount', 'primaryImage', 'images',
  'categoryId', 'brandId', 'brand', 'inStock', 'isNew',
  'weight', 'dimensions', 'tags', 'specifications', 'options',
  'additionalServices', 'metaTitle', 'metaDescription', 'sku',
  'isFlashDeal', 'isFeatured', 'isTrending', 'isDynamic',
  'isBestSeller', 'isRecommended', 'isPopular', 'showOnHomepage',
];

const parseOptionalFloat = (val) => {
  if (val === undefined) return undefined;
  if (val === null || val === '') return null;
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
};

const pickProductData = (body, isCreate = false) => {
  const data = {};
  for (const field of PRODUCT_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  if (data.name !== undefined) data.name = String(data.name).trim();
  if (data.price !== undefined) {
    const parsedPrice = Number(data.price);
    data.price = Number.isFinite(parsedPrice) ? parsedPrice : 0;
  }
  if (data.originalPrice !== undefined) data.originalPrice = parseOptionalFloat(data.originalPrice);
  if (data.discount !== undefined) data.discount = parseOptionalFloat(data.discount);
  if (data.brandId !== undefined) data.brandId = data.brandId || null;
  if (data.brand !== undefined) data.brand = data.brand || null;
  if (data.images !== undefined && !Array.isArray(data.images)) {
    data.images = data.primaryImage ? [data.primaryImage] : [];
  }

  if (data.sku !== undefined) {
    const trimmedSku = String(data.sku || '').trim();
    data.sku = trimmedSku || (isCreate ? `ALM-${Date.now()}` : undefined);
  } else if (isCreate) {
    data.sku = `ALM-${Date.now()}`;
  }

  if (isCreate && data.description === undefined) {
    data.description = data.shortDescription || data.name || '';
  }

  return data;
};

const createProduct = async (req, res) => {
  try {
    const { flagIds } = req.body;
    const data = pickProductData(req.body, true);

    if (!data.name) return res.status(400).json({ message: 'Product name is required' });
    if (!data.categoryId) return res.status(400).json({ message: 'Category is required' });
    if (!data.primaryImage) return res.status(400).json({ message: 'Primary image is required' });

    const product = await prisma.product.create({
      data: {
        ...data,
        customFlags: Array.isArray(flagIds) && flagIds.length > 0 ? {
          create: flagIds.map(flagId => ({ flagId }))
        } : undefined
      },
      include: { category: true, brandRef: true, customFlags: { include: { flag: true } } },
    });
    res.status(201).json(product);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'A product with this SKU already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { flagIds } = req.body;
    const data = pickProductData(req.body, false);

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...data,
        customFlags: Array.isArray(flagIds) ? {
          deleteMany: {},
          create: flagIds.map(flagId => ({ flagId }))
        } : undefined
      },
      include: { category: true, brandRef: true, customFlags: { include: { flag: true } } },
    });
    res.json(product);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'A product with this SKU already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.$transaction(async (tx) => {
      // 1. Delete dependent items referencing this product
      await tx.orderItem.deleteMany({ where: { productId: id } });
      await tx.cartItem.deleteMany({ where: { productId: id } });
      await tx.wishlistItem.deleteMany({ where: { productId: id } });
      await tx.review.deleteMany({ where: { productId: id } });
      await tx.productFlagAssignment.deleteMany({ where: { productId: id } });
      await tx.flashSaleProduct.deleteMany({ where: { productId: id } });

      // 2. Delete the product itself
      await tx.product.delete({ where: { id } });
    });
    res.json({ message: 'Product and all associated records deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
