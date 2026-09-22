
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting deep seed process...');

  // 1. Cleanup
  console.log('🧹 Cleaning up existing data...');
  await prisma.productFlagAssignment.deleteMany();
  await prisma.productFlag.deleteMany();
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.siteSettings.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.homepageSectionItem.deleteMany();
  await prisma.homepageSection.deleteMany();
  await prisma.address.deleteMany();
  // Do NOT delete users by default to avoid losing access, but we will upsert some.

  // 1.5. Users
  console.log('👤 Seeding administrative and customer users...');
  const bcrypt = require('bcryptjs');
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);

  const seedUsers = [
    { email: 'admin@almari.com', name: 'Almari Admin', role: 'admin', password: hashedAdminPassword },
    { email: 'super@almari.com', name: 'Super Admin', role: 'super_admin', password: hashedAdminPassword },
    { email: 'customer1@example.com', name: 'John Doe', role: 'customer', password: hashedAdminPassword },
    { email: 'customer2@example.com', name: 'Jane Smith', role: 'customer', password: hashedAdminPassword }
  ];

  for (const u of seedUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u
    });
  }

  // 2. Categories
  console.log('📁 Creating categories...');
  const catNames = [
    'Fruits & Vegetables', 'Breakfast & Dairy', 'Electronics', 'Meats & Seafood',
    'Beverages', 'Fashion & Clothing', 'Home & Furniture', 'Healthcare',
    'Grocery & Staples', 'Household Needs'
  ];
  const categoryMap = {};
  for (const name of catNames) {
    const cat = await prisma.category.create({
      data: { name, description: `Premium ${name} collection` }
    });
    categoryMap[name] = cat.id;
  }

  // 3. Brands
  console.log('🏭 Creating brands...');
  const brandData = [
    { name: 'Apple', slug: 'apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
    { name: 'Samsung', slug: 'samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
    { name: 'Sony', slug: 'sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg' },
    { name: 'Nestle', slug: 'nestle', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Nestle_logo.svg' },
    { name: 'Nike', slug: 'nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
    { name: 'Nepal Dairy', slug: 'nepal-dairy' },
    { name: 'Aakash SMS', slug: 'aakash-sms' }
  ];
  const brandMap = {};
  for (const b of brandData) {
    const brand = await prisma.brand.create({ data: b });
    brandMap[b.name] = brand.id;
  }

  // 4. Flags
  console.log('🚩 Creating product flags...');
  const flagData = [
    { name: 'FLASH', slug: 'flash-deal', color: '#ff0000' },
    { name: 'NEW', slug: 'new-arrival', color: '#002f4a' },
    { name: 'SALE', slug: 'sale', color: '#e6007e' },
    { name: 'BEST', slug: 'best-seller', color: '#E5A823' },
    { name: 'HOT', slug: 'hot-deal', color: '#ff4d4d' }
  ];
  const flagMap = {};
  for (const f of flagData) {
    const flag = await prisma.productFlag.create({ data: f });
    flagMap[f.name] = flag.id;
  }

  // 4. Products (Specific User Request)
  console.log('🍎 Seeding requested products...');
  const userProducts = [
    { name: 'Organic Red Apple (Jumla)', sku: 'FRU-001', cat: 'Fruits & Vegetables', price: 350, old: 450, flags: ['FLASH', 'NEW'], feat: true, brand: 'Apple' },
    { name: 'Fresh Farm Eggs', sku: 'EGG-001', cat: 'Breakfast & Dairy', price: 450, old: 500, flags: ['BEST'], feat: true },
    { name: 'Wireless Headphones', sku: 'ELE-001', cat: 'Electronics', price: 2500, old: 3500, flags: ['HOT'], trend: true, brand: 'Sony' },
    { name: 'Fresh Salmon Fillet', sku: 'SEA-001', cat: 'Meats & Seafood', price: 1200, old: 1500, flags: ['SALE'], pop: true },
    { name: 'Organic Milk', sku: 'DAI-001', cat: 'Breakfast & Dairy', price: 180, old: 220, rec: true, brand: 'Nepal Dairy' },
    { name: 'Green Tea', sku: 'BEV-001', cat: 'Beverages', price: 250, old: 300, trend: true },
    { name: 'Cotton T-Shirt', sku: 'FAS-001', cat: 'Fashion & Clothing', price: 800, old: 1200, flags: ['NEW'], pop: true, brand: 'Nike' },
    { name: 'Wooden Dining Table', sku: 'HOM-001', cat: 'Home & Furniture', price: 15000, old: 18000, feat: true },
    { name: 'Vitamin C Tablets', sku: 'HEA-001', cat: 'Healthcare', price: 300, old: 400, rec: true },
    { name: 'Banana', sku: 'FRU-002', cat: 'Fruits & Vegetables', price: 100, old: 120, flags: ['NEW'] }
  ];

  for (const p of userProducts) {
    await prisma.product.create({
      data: {
        name: p.name,
        sku: p.sku,
        categoryId: categoryMap[p.cat],
        brandId: p.brand ? brandMap[p.brand] : undefined,
        brand: p.brand || undefined,
        price: p.price,
        originalPrice: p.old,
        primaryImage: `https://picsum.photos/seed/${p.sku}/400/400`,
        images: JSON.stringify([`https://picsum.photos/seed/${p.sku}/400/400`]),
        description: `Premium quality ${p.name}.`,
        inStock: true,
        isNew: p.flags?.includes('NEW') || false,
        isFeatured: p.feat || false,
        isTrending: p.trend || false,
        isBestSeller: p.flags?.includes('BEST') || false,
        isPopular: p.pop || false,
        isRecommended: p.rec || false,
        isFlashDeal: p.flags?.includes('FLASH') || false,
        customFlags: p.flags ? {
          create: p.flags.map(fName => ({ flagId: flagMap[fName] }))
        } : undefined
      }
    });
  }

  // 5. Bulk Products
  console.log('📦 Seeding 200+ variety products...');
  for (let i = 0; i < 200; i++) {
    const catName = catNames[i % catNames.length];
    const sku = `BULK-${1000 + i}`;
    await prisma.product.create({
      data: {
        name: `Almari ${catName.split(' ')[0]} ${i + 1}`,
        sku,
        categoryId: categoryMap[catName],
        price: 150 + (i * 20),
        originalPrice: 250 + (i * 20),
        primaryImage: `https://picsum.photos/seed/${sku}/400/400`,
        images: JSON.stringify([`https://picsum.photos/seed/${sku}/400/400`]),
        description: 'Elite quality product from our premium collection.',
        inStock: true,
        isNew: i % 4 === 0,
        isFeatured: i % 6 === 0,
        isTrending: i % 5 === 0,
        isBestSeller: i % 7 === 0,
        isPopular: i % 8 === 0,
        isRecommended: i % 9 === 0,
        isFlashDeal: i % 10 === 0,
        rating: 4.0 + (i % 10) / 10,
        reviews: 10 + i
      }
    });
  }

  // 6. Blog Posts
  console.log('📝 Seeding blog posts...');
  const blogPosts = [
    {
      title: '10 Healthy Eating Tips for a Better Lifestyle',
      slug: 'healthy-eating-tips',
      excerpt: 'Discover how simple dietary changes can significantly improve your daily energy and long-term health.',
      content: 'Eating healthy doesn\'t have to be complicated. Start by incorporating more whole foods like fruits, vegetables, and whole grains into your meals. Hydration is also key—aim for at least 8 glasses of water a day. Avoid processed sugars and try to cook at home more often to control your ingredients. Small, consistent changes lead to big results.',
      image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=800',
      isPublished: true
    },
    {
      title: 'The Future of Smart Home Technology',
      slug: 'future-smart-home',
      excerpt: 'Explore the latest trends in home automation and how AI is changing the way we live.',
      content: 'Smart homes are becoming more intuitive than ever. From voice-controlled lighting to AI-powered thermostats that learn your schedule, technology is making our lives more convenient and energy-efficient. In this post, we dive into the must-have gadgets for 2024 and how to build a seamless smart home ecosystem.',
      image: 'https://images.unsplash.com/photo-1558002038-103792e07a70?auto=format&fit=crop&q=80&w=800',
      isPublished: true
    }
  ];
  for (const post of blogPosts) {
    await prisma.blogPost.create({ data: post });
  }

  // 7. Site Settings (Slider, Config, etc)
  console.log('⚙️ Seeding site customization...');
  const siteConfig = {
    storeName: "eAlmari",
    logoText: "eAlmari",
    logoImage: "/logo.jpg",
    primaryColor: "#002D42",
    accentColor: "#D49B24",
    secondaryColor: "#475569",
    tertiaryColor: "#94a3b8",
    quaternaryColor: "#cbd5e1",
    accentHighlights: "#F59E0B",
    supportPhone: "+977 9801234567",
    supportEmail: "hello@ealmari.com",
    address: "Kathmandu, Nepal",
    footerAbout: "eAlmari is Nepal's premier online shopping destination. Authentic products, best prices, and fast delivery.",
    heroSlides: [
      {
        badge: "Special Summer Offer!",
        title: "Fresh & Organic Fruits",
        subtitle: "Get up to 30% off on all organic fruits sourced directly from local farms.",
        image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=1200",
        buttonText: "Shop Now",
        buttonUrl: "/shop?category=Fruits%20%26%20Vegetables",
        priceText: "From NPR 99",
        enabled: true
      },
      {
        badge: "New Tech Arrival",
        title: "Latest Gadgets 2025",
        subtitle: "Explore our new collection of wireless headphones, smartwatches and more.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200",
        buttonText: "Discover Tech",
        buttonUrl: "/shop?category=Electronics",
        priceText: "Save up to 40%",
        enabled: true
      },
      {
        badge: "Home Style",
        title: "Premium Furniture",
        subtitle: "Modern designs for your living room. Durable and stylish wooden furniture.",
        image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200",
        buttonText: "View Collection",
        buttonUrl: "/shop?category=Home%20%26%20Furniture",
        enabled: true
      }
    ],
    heroSideCards: [
      {
        eyebrow: "Flash Sale",
        title: "Kitchen Essentials",
        image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600",
        buttonText: "Shop Now",
        buttonUrl: "/shop?category=Household%20Needs",
        enabled: true
      },
      {
        eyebrow: "Home Decor",
        title: "Modern Furniture",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600",
        buttonText: "Discover",
        buttonUrl: "/shop?category=Home%20&%20Furniture",
        enabled: true
      },
      {
        eyebrow: "Weekly Special",
        title: "Healthy Snack Packs",
        image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&q=80&w=600",
        buttonText: "Shop Now",
        buttonUrl: "/shop?category=Beverages",
        enabled: true
      }
    ],
    // About Us Page Data
    about_hero_title: "About eAlmari",
    about_hero_subtitle: "Your trusted destination for premium fashion, apparel and lifestyle products in Nepal.",
    about_hero_image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200",
    about_story_title: "Elevating Shopping Standards in Nepal since 2025",
    about_story_content: "Nepal's premier online shopping destination. Quality guaranteed. eAlmari started with a simple mission: to provide every household in Nepal with access to genuine, high-quality products at fair prices.",
    about_story_image: "https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=1200",
    stat_customers: "50k+",
    stat_products: "10k+",
    stat_delivery: "24h",
    stat_support: "24/7",

    heroBottomCards: [

      { title: 'Organic Foods', badge: 'FARM FRESH', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=400', eyebrow: 'Healthy' },
      { title: 'Best Gadgets', badge: 'LATEST TECH', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=400', eyebrow: 'Smart' },
      { title: 'Winter Sale', badge: 'UP TO 50%', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400', eyebrow: 'Deals' },
      { title: 'Home Style', badge: 'NEW ARRIVALS', image: 'https://images.unsplash.com/photo-1583847268964-b28dc2f51ac9?auto=format&fit=crop&q=80&w=400', eyebrow: 'Trend' }
    ],
    announcements: [
      { text: "FREE delivery on your first 3 orders above NPR 1000!", link: "/shop", isActive: true },
      { text: "Organic Food Festival: Get 20% off this weekend!", link: "/shop?category=Fruits%20%26%20Vegetables", isActive: true },
      { text: "New Collection: Premium Electronic Gadgets Arrived!", link: "/shop?category=Electronics", isActive: true }
    ],
    announcementSpeed: 5000,

    navItems: [
      { label: "Home", url: "/" },
      { label: "Shop", url: "/shop" },
      { label: "Flash Deals", url: "/shop?filter=flash" },
      { label: "Categories", url: "/shop" },
      { label: "Blog", url: "/blog" }
    ],
    footerColumns: [
      {
        title: "Company",
        links: [
          { label: "About Us", url: "/about" },
          { label: "Contact", url: "/contact" },
          { label: "Blog", url: "/blog" }
        ]
      },
      {
        title: "Support",
        links: [
          { label: "FAQs", url: "/faqs" },
          { label: "Shipping", url: "/shipping" },
          { label: "Returns", url: "/returns" }
        ]
      },
      {
        title: "Payment Partners",
        links: [
          { label: "eSewa", url: "#" },
          { label: "Khalti", url: "#" }
        ]
      }
    ],
    chatSettings: {
      enabled: true,
      welcomeMessage: "Hi! Welcome to Almari. How can we assist you today?",
      faq: [
        { question: "How to track order?", answer: "Go to Profile > Orders to track your active shipments." },
        { question: "Delivery areas?", answer: "We deliver all across Nepal including major cities." },
        { question: "Return policy?", answer: "We have a 7-day easy return policy for all genuine products." }
      ],
      collectGuestInfo: true
    },
    newsletters: [
      { email: "newsletter1@example.com", subscribedAt: new Date().toISOString() },
      { email: "newsletter2@example.com", subscribedAt: new Date().toISOString() }
    ],
    homepageProductSections: [
      { title: "Hot Flash Deals", subtitle: "Ending very soon!", flag: "isFlashDeal", enabled: true, limit: 12 },
      { title: "New Arrivals", subtitle: "Freshly added to our store", flag: "isNew", enabled: true, limit: 12 },
      { title: "Best Sellers", subtitle: "Our customers love these", flag: "isBestSeller", enabled: true, limit: 12 },
      { title: "Trending Items", subtitle: "What everyone is buying", flag: "isTrending", enabled: true, limit: 18 },
      { title: "Handpicked Featured", subtitle: "Selected by our experts", flag: "isFeatured", enabled: true, limit: 12 }
    ],
    promoBanners: [
      { title: "Fresh Organic Goods", badge: "DAILY DEALS", image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=1200", color: "#22c55e", position: "afterHero", showOnHomepage: true },
      { title: "Luxury Fashion Wear", badge: "EXCLUSIVE", image: "https://images.unsplash.com/photo-1445205170230-053b830c6039?auto=format&fit=crop&q=80&w=1200", color: "#e6007e", position: "afterProducts", showOnHomepage: true }
    ],
    smtpSettings: {
      enabled: false,
      host: "smtp.gmail.com",
      port: 587,
      user: "support@almari.com",
      pass: "password123",
      from: "Almari Support <support@almari.com>",
      adminEmail: "admin@almari.com"
    },
    smsSettings: {
      enabled: false,
      provider: "aakash",
      accountSid: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      authToken: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      fromNumber: "ALMARI",
      aakashToken: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    },
    flashPopupEnabled: true,
    flashPopupTitle: "Special Summer Offer!",
    flashPopupText: "Get extra 20% off on all fresh produce this weekend. Use code SUMMER20.",
    metaTitle: "Almari - Premium Online Shopping in Nepal",
    footerAbout: "The most premium online shopping destination in Nepal. Quality guaranteed.",
    supportPhone: "+977 9801234567",
    copyrightText: "© 2026 Almari Store. All rights reserved.",
    footerColumns: [
      { title: "Company", links: [{ label: "About Us", url: "/about" }, { label: "Contact", url: "/contact" }, { label: "Blog", url: "/blog" }] },
      { title: "Support", links: [{ label: "FAQs", url: "/faq" }, { label: "Shipping", url: "/shipping" }, { label: "Returns", url: "/returns" }] }
    ],
    paymentPartners: [
      { name: "eSewa", logo: "https://esewa.com.np/common/images/esewa_logo.png", enabled: true },
      { name: "Khalti", logo: "https://khalti.com/static/resources/img/khalti-logo.png", enabled: true }
    ]
  };

  await prisma.siteSettings.upsert({
    where: { key: 'site_customization' },
    update: { value: JSON.stringify(siteConfig) },
    create: { key: 'site_customization', value: JSON.stringify(siteConfig) }
  });

  // Seed Homepage Builder Sections
  console.log('🏗️ Seeding Homepage Builder Sections...');
  const defaultSections = [
    { sectionType: 'Hero Slider', title: 'Main Hero Slider', position: 0 },
    { sectionType: 'Hero Bottom Promo Cards', title: 'Promo Cards', position: 1 },
    { sectionType: 'Shop by Brand', title: 'Top Brands', position: 2 },
    { sectionType: 'Featured Products', title: 'Handpicked Featured', position: 3 },
    { sectionType: 'Promo Banner', title: 'Summer Collection Sale', subtitle: 'Up to 50% Off on All items', bannerImage: 'https://images.unsplash.com/photo-1441984908746-d47b8b240bd8?auto=format&fit=crop&q=80&w=1200', position: 4 },
    { sectionType: 'Best Sellers', title: 'Best Sellers', position: 5 },
    { sectionType: 'New Arrivals', title: 'New Arrivals', position: 6 },
    { sectionType: 'Promo Banner', title: 'Exclusive Tech Deals', subtitle: 'Latest Gadgets at Best Prices', bannerImage: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=1200', position: 7 },
    { sectionType: 'Flash Deals', title: 'Hot Flash Deals', position: 8 },
    { sectionType: 'Newsletter', title: 'Join Newsletter', position: 9, isActive: false },
    { sectionType: 'Testimonials', title: 'Customer Reviews', position: 10, isActive: true },
    { sectionType: 'Footer CTA', title: 'Footer Banner', position: 11, isActive: false }
  ];

  for (const sec of defaultSections) {
    const section = await prisma.homepageSection.upsert({
      where: { slug: sec.title.toLowerCase().replace(/ /g, '-') },
      update: {
        position: sec.position,
        isActive: sec.isActive !== undefined ? sec.isActive : true,
        subtitle: sec.subtitle || null,
        bannerImage: sec.bannerImage || null
      },
      create: {
        title: sec.title,
        slug: sec.title.toLowerCase().replace(/ /g, '-'),
        sectionType: sec.sectionType,
        position: sec.position,
        isActive: sec.isActive !== undefined ? sec.isActive : true,
        subtitle: sec.subtitle || null,
        bannerImage: sec.bannerImage || null
      }
    });

    // Clear existing items to prevent duplication
    await prisma.homepageSectionItem.deleteMany({ where: { sectionId: section.id } });

    // Seed items for specific sections
    if (sec.sectionType === 'Hero Slider') {
      const sliderItems = [
        { title: "Fresh & Organic Fruits", subtitle: "Special Summer Offer!", buttonText: "Shop Now", buttonUrl: "/shop?category=Fruits%20%26%20Vegetables", image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=1200" },
        { title: "Premium Fashion 2025", subtitle: "New Style Arrival", buttonText: "Discover Now", buttonUrl: "/shop?category=Fashion", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200" },
        { title: "Smart Home Tech", subtitle: "Future of Living", buttonText: "Explore Tech", buttonUrl: "/shop?category=Electronics", image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1200" },
        { title: "Luxury Watches", subtitle: "Timeless Elegance", buttonText: "View Collection", buttonUrl: "/shop?category=Accessories", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=1200" }
      ];
      for (const [idx, item] of sliderItems.entries()) {
        await prisma.homepageSectionItem.create({
          data: { ...item, sectionId: section.id, position: idx }
        });
      }
    }

    if (sec.sectionType === 'Hero Bottom Promo Cards') {
      const promoItems = [
        { title: 'Organic Foods', subtitle: 'Healthy', buttonText: 'FARM FRESH', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=400', buttonUrl: '/shop' },
        { title: 'Best Gadgets', subtitle: 'Smart', buttonText: 'LATEST TECH', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=400', buttonUrl: '/shop' },
        { title: 'Winter Sale', subtitle: 'Deals', buttonText: 'UP TO 50%', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400', buttonUrl: '/shop' },
        { title: 'Home Style', subtitle: 'Trend', buttonText: 'NEW ARRIVALS', image: 'https://images.unsplash.com/photo-1583847268964-b28dc2f51ac9?auto=format&fit=crop&q=80&w=400', buttonUrl: '/shop' }
      ];
      for (const [idx, item] of promoItems.entries()) {
        await prisma.homepageSectionItem.create({
          data: { ...item, sectionId: section.id, position: idx }
        });
      }
    }

    if (['Featured Products', 'Best Sellers', 'Trending Items', 'New Arrivals', 'Flash Deals'].includes(sec.sectionType)) {
      // Add side cards for product sections
      await prisma.homepageSectionItem.create({
        data: {
          sectionId: section.id,
          position: -1,
          title: 'Premium Selection',
          subtitle: 'HANDPICKED',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400',
          buttonUrl: '/shop'
        }
      });
      await prisma.homepageSectionItem.create({
        data: {
          sectionId: section.id,
          position: 99,
          title: 'Special Deals',
          subtitle: 'LIMITED TIME',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
          buttonUrl: '/shop'
        }
      });
    }
  }

  // 8. Orders & Reviews (Sample Data)
  console.log('📦 Seeding orders and reviews...');
  const users = await prisma.user.findMany({ take: 5 });
  const products = await prisma.product.findMany({ take: 20 });

  if (users.length > 0 && products.length > 0) {
    for (let i = 0; i < 15; i++) {
      const user = users[i % users.length];
      const product = products[i % products.length];

      // Create Address if not exists
      const address = await prisma.address.create({
        data: {
          userId: user.id,
          type: 'home',
          street: '123 Market St',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          country: 'Nepal'
        }
      });

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          addressId: address.id,
          total: product.price * 2,
          status: i % 3 === 0 ? 'Delivered' : (i % 3 === 1 ? 'Processing' : 'Shipped'),
          items: {
            create: [
              { productId: product.id, quantity: 2, price: product.price }
            ]
          }
        }
      });

      // Add a review
      await prisma.review.create({
        data: {
          productId: product.id,
          userId: user.id,
          rating: 4 + (i % 2),
          title: 'Great product!',
          comment: 'I really enjoyed using this product. The quality is top-notch and delivery was fast.',
          status: 'approved'
        }
      }).catch(() => { }); // Ignore duplicate review errors
    }
  }

  // 9. Communication Hub Seeding
  console.log('✉️ Seeding communication templates and settings...');

  const emailTemplates = [
    { name: 'new_order_admin', subject: 'NEW ORDER ALERT - #{order_id}', body: '<h1>New Order Received</h1><p>Admin, you have a new order #{order_id} from {customer_name}. Total: NPR {total}.</p>' },
    { name: 'new_order_customer', subject: 'Order Confirmed - #{order_id}', body: '<h1>Thank You!</h1><p>Hello {customer_name}, your order #{order_id} has been received and is being processed.</p>' },
    { name: 'order_status', subject: 'Order Update - #{order_id}', body: '<h1>Order Update</h1><p>Your order #{order_id} is now {status}.</p>' },
    { name: 'new_user', subject: 'Welcome to eAlmari!', body: '<h1>Welcome</h1><p>Hello {customer_name}, welcome to our store.</p>' },
    { name: 'low_stock', subject: 'Low Stock Alert: {product_name}', body: '<h1>Inventory Alert</h1><p>Product {product_name} (SKU: {sku}) is running low on stock. Only {stock} left.</p>' }
  ];

  for (const t of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { name: t.name },
      update: t,
      create: t
    });
  }

  const smsTemplates = [
    { name: 'new_order_admin', body: 'New Order: #{order_id} from {customer_name}. Total: {total}.' },
    { name: 'new_order_customer', body: 'Hi {customer_name}, your order #{order_id} is confirmed. Team eAlmari.' },
    { name: 'order_status', body: 'Order #{order_id} status updated to {status}.' }
  ];

  for (const t of smsTemplates) {
    await prisma.smsTemplate.upsert({
      where: { name: t.name },
      update: t,
      create: t
    });
  }

  const notificationEvents = [
    { event: 'new_order', adminEmail: true, customerEmail: true, adminSms: true, customerSms: true },
    { event: 'order_status', adminEmail: false, customerEmail: true, adminSms: false, customerSms: true },
    { event: 'new_user', adminEmail: true, customerEmail: true, adminSms: false, customerSms: false }
  ];

  for (const e of notificationEvents) {
    await prisma.notificationSetting.upsert({
      where: { event: e.event },
      update: e,
      create: e
    });
  }

  // 10. Admin Notification Recipients
  console.log('👥 Seeding notification recipients...');
  const recipients = [
    { type: 'email', value: 'admin@ealmari.com', name: 'Primary Admin', isActive: true },
    { type: 'email', value: 'orders@ealmari.com', name: 'Order Processing', isActive: true },
    { type: 'email', value: 'support@ealmari.com', name: 'Customer Support', isActive: true },
    { type: 'sms', value: '9801234567', name: 'Admin Primary SMS', isActive: true },
    { type: 'sms', value: '9841000000', name: 'Operations SMS', isActive: true }
  ];

  for (const r of recipients) {
    await prisma.notificationRecipient.upsert({
      where: { id: `recipient-${r.value}` },
      update: r,
      create: { id: `recipient-${r.value}`, ...r }
    }).catch(() => { });
  }

  // 11. SMS Gateway Seeding (Aakash SMS Nepal)
  console.log('📲 Seeding SMS Gateways (Aakash SMS)...');
  await prisma.smsGatewaySetting.upsert({
    where: { id: 'aakash-sms-default' },
    update: {
      providerName: 'Aakash SMS (Nepal)',
      gatewayUrl: 'https://sms.aakashsms.com/sms/v3/send',
      apiKey: 'YOUR_AAKASH_TOKEN',
      senderId: 'eAlmari',
      authToken: 'YOUR_AAKASH_TOKEN',
      isActive: true
    },
    create: {
      id: 'aakash-sms-default',
      providerName: 'Aakash SMS (Nepal)',
      gatewayUrl: 'https://sms.aakashsms.com/sms/v3/send',
      apiKey: 'YOUR_AAKASH_TOKEN',
      senderId: 'eAlmari',
      authToken: 'YOUR_AAKASH_TOKEN',
      isActive: true
    }
  });

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
