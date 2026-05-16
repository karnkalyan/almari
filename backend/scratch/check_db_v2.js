const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const settings = await prisma.siteSettings.findUnique({ where: { key: 'site' } });
  if (settings) {
    const val = JSON.parse(settings.value);
    console.log({
      heroSlides: val.heroSlides?.length || 0,
      heroSideCards: val.heroSideCards?.length || 0,
      promoBanners: val.promoBanners?.length || 0,
      homeSections: val.homeSections ? 'configured' : 'missing'
    });
  }
  
  // Try to call the logic from productFlagController
  try {
    const flags = await prisma.productFlag.findMany({
      include: {
        products: {
          include: {
            product: { include: { category: true } },
          },
        },
      },
    });
    console.log('Flags fetched successfully:', flags.length);
  } catch (error) {
    console.error('Flags fetch failed:', error.message);
  }
}

check().finally(() => prisma.$disconnect());
