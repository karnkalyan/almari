
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const counts = await prisma.conversation.count();
    console.log('Conversations count:', counts);
    const convs = await prisma.conversation.findMany({
      include: { user: true, messages: true }
    });
    console.log('Conversations:', JSON.stringify(convs, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
