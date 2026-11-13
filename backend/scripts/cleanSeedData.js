/**
 * Production Seed Data Cleaner
 * 
 * Safely removes demo / seed data from the database:
 * - Deletes: Products, Categories, Orders, OrderItems, Reviews, Carts, Wishlists,
 *            FlashSales, ProductFlags, and Customer users.
 * 
 * - Strictly PRESERVES:
 *   1. Brands (All brand entries remain intact)
 *   2. Administrative / Staff logins (super_admin, admin, editor, sell_staff, crm_staff)
 *   3. Storefront configuration & branding (SiteSettings, Hero banners, Footer, etc.)
 *   4. Homepage section layouts
 */

const prisma = require('../prismaClient');

const STAFF_ROLES = ['super_admin', 'admin', 'editor', 'sell_staff', 'crm_staff'];

async function cleanSeedData() {
  console.log('====================================================');
  console.log('🧹 Almari Production Data Cleanup');
  console.log('====================================================\n');

  try {
    // 1. Identify staff vs customer users to preserve login details
    const staffUsers = await prisma.user.findMany({
      where: { role: { in: STAFF_ROLES } },
      select: { id: true, email: true, role: true, name: true }
    });
    const staffUserIds = staffUsers.map(u => u.id);

    console.log(`👤 Preserving ${staffUsers.length} staff/admin accounts:`);
    staffUsers.forEach(u => console.log(`   - [${u.role}] ${u.email} (${u.name || 'Unnamed'})`));
    console.log('');

    // 2. Identify customer users to remove
    const customerUsers = await prisma.user.findMany({
      where: { id: { notIn: staffUserIds } },
      select: { id: true, email: true }
    });
    const customerIds = customerUsers.map(u => u.id);
    console.log(`👤 Identified ${customerIds.length} customer user accounts to remove.\n`);

    // 3. Count brands to confirm preservation
    const brandCount = await prisma.brand.count();
    console.log(`🏷️ Preserving all ${brandCount} Brand records intact.\n`);

    console.log('🔄 Executing transactional cleanup in safe dependency order...');

    const results = await prisma.$transaction(async (tx) => {
      // Step A: Dependent customer items
      const deletedReviews = await tx.review.deleteMany();
      const deletedCartItems = await tx.cartItem.deleteMany();
      const deletedWishlistItems = await tx.wishlistItem.deleteMany();
      const deletedProductFlagAssignments = await tx.productFlagAssignment.deleteMany();
      const deletedFlashSaleProducts = await tx.flashSaleProduct.deleteMany();
      const deletedFlashSales = await tx.flashSale.deleteMany();

      // Step B: Orders and order items
      const deletedOrderItems = await tx.orderItem.deleteMany();
      const deletedOrders = await tx.order.deleteMany();

      // Step C: Customer addresses & chat messages
      let deletedCustomerAddresses = { count: 0 };
      let deletedChatMessages = { count: 0 };
      let deletedConversations = { count: 0 };

      if (customerIds.length > 0) {
        deletedCustomerAddresses = await tx.address.deleteMany({
          where: { userId: { in: customerIds } }
        });
        deletedChatMessages = await tx.chatMessage.deleteMany({
          where: { senderId: { in: customerIds } }
        });
        deletedConversations = await tx.conversation.deleteMany({
          where: { customerId: { in: customerIds } }
        });
      }

      // Step D: Delete Customer Users (keeping admin & staff)
      let deletedCustomers = { count: 0 };
      if (customerIds.length > 0) {
        deletedCustomers = await tx.user.deleteMany({
          where: { id: { in: customerIds } }
        });
      }

      // Step E: Disassociate any brand references from products before product deletion (for complete safety)
      await tx.product.updateMany({
        data: { brandId: null }
      });

      // Step F: Delete all Products
      const deletedProducts = await tx.product.deleteMany();

      // Step G: Delete all Categories
      const deletedCategories = await tx.category.deleteMany();

      return {
        reviews: deletedReviews.count,
        cartItems: deletedCartItems.count,
        wishlistItems: deletedWishlistItems.count,
        flagAssignments: deletedProductFlagAssignments.count,
        flashSaleProducts: deletedFlashSaleProducts.count,
        flashSales: deletedFlashSales.count,
        orderItems: deletedOrderItems.count,
        orders: deletedOrders.count,
        customerAddresses: deletedCustomerAddresses.count,
        customerMessages: deletedChatMessages.count,
        customerConversations: deletedConversations.count,
        customers: deletedCustomers.count,
        products: deletedProducts.count,
        categories: deletedCategories.count
      };
    });

    console.log('✅ Cleanup completed successfully!\n');
    console.log('📊 Summary of deleted seed/demo items:');
    console.log(`   - Products: ${results.products}`);
    console.log(`   - Categories: ${results.categories}`);
    console.log(`   - Orders: ${results.orders} (${results.orderItems} order items)`);
    console.log(`   - Customers: ${results.customers} (${results.customerAddresses} addresses)`);
    console.log(`   - Reviews: ${results.reviews}`);
    console.log(`   - Carts & Wishlists: ${results.cartItems} cart items, ${results.wishlistItems} wishlist items`);
    console.log(`   - Flash Sales: ${results.flashSales} sales (${results.flashSaleProducts} items)`);
    console.log('');
    console.log('🛡️ Preserved:');
    console.log(`   - ${brandCount} Brands (unmodified)`);
    console.log(`   - ${staffUsers.length} Admin/Staff logins (unmodified)`);
    console.log('   - Store settings, Hero banners, Navigation & Footer (unmodified)');
    console.log('====================================================\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanSeedData();
