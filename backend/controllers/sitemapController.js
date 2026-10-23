const prisma = require('../prismaClient');

const escapeXml = (unsafe) => {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const formatDate = (date) => {
  try {
    return new Date(date || Date.now()).toISOString();
  } catch {
    return new Date().toISOString();
  }
};

const getBaseUrl = (req) => {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/+$/, '');
  }
  const rawHost = (typeof req?.get === 'function' ? (req.get('x-forwarded-host') || req.get('host')) : req?.headers?.host) || '';
  const host = String(rawHost).trim().toLowerCase();

  // If host is empty or internal container/localhost, default to production domain
  if (!host || host.includes('localhost') || host.includes('127.0.0.1') || host.includes('backend') || host.includes(':5000') || !host.includes('.')) {
    return 'https://ealmari.com.np';
  }

  const forwardedProto = typeof req?.get === 'function' ? req.get('x-forwarded-proto') : req?.headers?.['x-forwarded-proto'];
  const protocol = forwardedProto || req?.protocol || 'https';
  return `${protocol}://${host}`.replace(/\/+$/, '');
};

const getSitemap = async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);

    // Fetch active products, categories, blogs, brands
    const [products, categories, blogs, brands] = await Promise.all([
      prisma.product.findMany({
        select: { id: true, name: true, primaryImage: true, updatedAt: true },
        take: 5000,
      }),
      prisma.category.findMany({
        select: { id: true, name: true, image: true, updatedAt: true },
      }),
      prisma.blogPost.findMany({
        where: { isPublished: true },
        select: { slug: true, title: true, image: true, updatedAt: true },
      }),
      prisma.brand.findMany({
        select: { slug: true, name: true, updatedAt: true },
      }),
    ]);

    const staticRoutes = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/shop', priority: '0.9', changefreq: 'daily' },
      { path: '/about', priority: '0.7', changefreq: 'monthly' },
      { path: '/blog', priority: '0.8', changefreq: 'daily' },
      { path: '/coupons', priority: '0.7', changefreq: 'weekly' },
      { path: '/offers', priority: '0.8', changefreq: 'daily' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n`;
    xml += `        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
    xml += `        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n`;
    xml += `        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n`;

    const now = formatDate();

    // 1. Static storefront pages
    for (const route of staticRoutes) {
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(`${baseUrl}${route.path}`)}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // 2. Product Detail Pages (/product/:id) with Image Extension
    for (const prod of products) {
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(`${baseUrl}/product/${prod.id}`)}</loc>\n`;
      xml += `    <lastmod>${formatDate(prod.updatedAt)}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      if (prod.primaryImage && prod.primaryImage.startsWith('http')) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${escapeXml(prod.primaryImage)}</image:loc>\n`;
        if (prod.name) {
          xml += `      <image:title>${escapeXml(prod.name)}</image:title>\n`;
        }
        xml += `    </image:image>\n`;
      }
      xml += `  </url>\n`;
    }

    // 3. Category Catalog Pages (/shop?category=...)
    for (const cat of categories) {
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(`${baseUrl}/shop?category=${encodeURIComponent(cat.name)}`)}</loc>\n`;
      xml += `    <lastmod>${formatDate(cat.updatedAt)}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      if (cat.image && cat.image.startsWith('http')) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${escapeXml(cat.image)}</image:loc>\n`;
        xml += `      <image:title>${escapeXml(cat.name)}</image:title>\n`;
        xml += `    </image:image>\n`;
      }
      xml += `  </url>\n`;
    }

    // 4. Published Blog Posts (/blog/:slug)
    for (const post of blogs) {
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(`${baseUrl}/blog/${post.slug}`)}</loc>\n`;
      xml += `    <lastmod>${formatDate(post.updatedAt)}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      if (post.image && post.image.startsWith('http')) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${escapeXml(post.image)}</image:loc>\n`;
        if (post.title) {
          xml += `      <image:title>${escapeXml(post.title)}</image:title>\n`;
        }
        xml += `    </image:image>\n`;
      }
      xml += `  </url>\n`;
    }

    // 5. Brands (/shop?brand=...)
    for (const b of brands) {
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(`${baseUrl}/shop?brand=${encodeURIComponent(b.slug)}`)}</loc>\n`;
      xml += `    <lastmod>${formatDate(b.updatedAt)}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>');
  }
};

const getRobots = (req, res) => {
  const baseUrl = getBaseUrl(req);

  const robotsTxt = `# eAlmari Production Robots Configuration
User-agent: *
Allow: /
Allow: /shop
Allow: /about
Allow: /blog
Allow: /coupons
Allow: /offers
Allow: /product/

# Disallow administrative, private, checkout and user account areas
Disallow: /admin
Disallow: /admin/
Disallow: /api/
Disallow: /login
Disallow: /register
Disallow: /cart
Disallow: /checkout
Disallow: /profile
Disallow: /order/

# Host and Dynamic XML Sitemap
Host: ${new URL(baseUrl).host}
Sitemap: ${baseUrl}/sitemap.xml
`;

  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=86400');
  return res.status(200).send(robotsTxt);
};

module.exports = {
  getSitemap,
  getRobots,
  getBaseUrl,
};
