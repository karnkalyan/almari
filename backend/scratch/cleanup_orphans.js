const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log('Cleaning up orphaned ProductFlagAssignment records...');
  
  // Find assignments where product doesn't exist
  const assignments = await prisma.productFlagAssignment.findMany();
  const products = await prisma.product.findMany({ select: { id: true } });
  const productIds = new Set(products.map(p => p.id));
  
  let deletedCount = 0;
  for (const assignment of assignments) {
    if (!productIds.has(assignment.productId)) {
      await prisma.productFlagAssignment.delete({ where: { id: assignment.id } });
      deletedCount++;
    }
  }
  
  console.log(`Deleted ${deletedCount} orphaned assignments.`);
}

cleanup().finally(() => prisma.$disconnect());
