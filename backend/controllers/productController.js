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
    const param = req.params.id;
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug: param }, { id: param }],
      },
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
  'name', 'slug', 'shortDescription', 'description', 'longDescription',
  'price', 'originalPrice', 'discount', 'primaryImage', 'images',
  'categoryId', 'brandId', 'brand', 'inStock', 'isNew',
  'weight', 'dimensions', 'tags', 'specifications', 'options',
  'additionalServices', 'metaTitle', 'metaDescription', 'sku',
  'isFlashDeal', 'isFeatured', 'isTrending', 'isDynamic',
  'isBestSeller', 'isRecommended', 'isPopular', 'showOnHomepage',
];

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 160);

const stripHtml = (value) =>
  String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const ensureUniqueSlug = async (rawSlug, excludeId = null) => {
  const base = slugify(rawSlug) || `product-${Date.now()}`;
  let candidate = base;
  let counter = 2;

  while (true) {
    const existing = await prisma.product.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${base.slice(0, 150)}-${counter}`;
    counter += 1;
  }
};

const generateUniqueSku = async (name, brand, excludeId = null) => {
  const cleanBrand = String(brand || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 3);
  const cleanName = String(name || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) || 'PROD';
  const prefix = ['ALM', cleanBrand, cleanName].filter(Boolean).join('-');

  for (let i = 0; i < 10; i++) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${prefix}-${rand}`;
    const existing = await prisma.product.findFirst({
      where: {
        sku: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  return `${prefix}-${Date.now().toString().slice(-6)}`;
};

const buildMetaTitle = (name, brand) => {
  const parts = [String(name || '').trim(), String(brand || '').trim()].filter(Boolean);
  const title = parts.length > 1 ? `${parts[0]} by ${parts[1]} | Almari` : `${parts[0]} | Almari`;
  return title.slice(0, 160);
};

const buildMetaDescription = ({ name, shortDescription, description, longDescription, price }) => {
  const raw = stripHtml(shortDescription) || stripHtml(description) || stripHtml(longDescription);
  if (raw) {
    return raw.length > 160 ? `${raw.slice(0, 157).trim()}...` : raw;
  }
  const priceText = Number.isFinite(Number(price)) && Number(price) > 0 ? ` for NPR ${Number(price).toLocaleString()}` : '';
  return `Buy ${String(name || '').trim()}${priceText} online at Almari. Fast delivery across Nepal.`.slice(0, 160);
};

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
  if (data.slug !== undefined) data.slug = slugify(data.slug);
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
    data.sku = String(data.sku || '').trim();
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

    data.slug = await ensureUniqueSlug(data.slug || data.name);
    if (!data.sku) {
      data.sku = await generateUniqueSku(data.name, data.brand);
    }
    if (!String(data.metaTitle || '').trim()) {
      data.metaTitle = buildMetaTitle(data.name, data.brand);
    }
    if (!String(data.metaDescription || '').trim()) {
      data.metaDescription = buildMetaDescription(data);
    }

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
      return res.status(400).json({ message: 'A product with this SKU or slug already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { flagIds } = req.body;
    const data = pickProductData(req.body, false);

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const resolvedName = data.name || existing.name;
    const resolvedBrand = data.brand !== undefined ? data.brand : existing.brand;

    if (data.slug !== undefined) {
      data.slug = await ensureUniqueSlug(data.slug || resolvedName, id);
    } else if (!existing.slug) {
      data.slug = await ensureUniqueSlug(resolvedName, id);
    }

    if (data.sku !== undefined && !data.sku) {
      data.sku = await generateUniqueSku(resolvedName, resolvedBrand, id);
    } else if (!existing.sku && data.sku === undefined) {
      data.sku = await generateUniqueSku(resolvedName, resolvedBrand, id);
    }

    if (data.metaTitle !== undefined && !String(data.metaTitle || '').trim()) {
      data.metaTitle = buildMetaTitle(resolvedName, resolvedBrand);
    } else if (!existing.metaTitle && data.metaTitle === undefined) {
      data.metaTitle = buildMetaTitle(resolvedName, resolvedBrand);
    }

    if (data.metaDescription !== undefined && !String(data.metaDescription || '').trim()) {
      data.metaDescription = buildMetaDescription({ ...existing, ...data, name: resolvedName });
    } else if (!existing.metaDescription && data.metaDescription === undefined) {
      data.metaDescription = buildMetaDescription({ ...existing, ...data, name: resolvedName });
    }

    const product = await prisma.product.update({
      where: { id },
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
      return res.status(400).json({ message: 'A product with this SKU or slug already exists' });
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
