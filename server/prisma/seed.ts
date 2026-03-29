import "dotenv/config";
import prisma from '../src/lib/prisma';

async function main() {
  console.log('[Seed] Seeding database...');

  // 1. Create AI Bot user
  const bot = await prisma.user.upsert({
    where: { email: 'ai-assistant@shipper-chat.com' },
    update: {},
    create: {
      id: 'bot-assistant',
      name: 'AI Logistics Bot',
      email: 'ai-assistant@shipper-chat.com',
      isBot: true,
      status: 'ONLINE',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Logistics'
    },
  });

  // 2. Create some initial users
  const users = [
    { name: 'Kimi Tanaka', email: 'kimi@example.com' },
    { name: 'Bianca Nubia', email: 'bianca@example.com' },
    { name: 'Yomi Immanuel', email: 'yomi@example.com' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`
      },
    });
  }

  // 3. Create a conversation between bot and the first user with a welcome message
  const firstUser = await prisma.user.findUnique({ where: { email: users[0]!.email } });
  if (firstUser) {
    const conversation = await prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { user: { connect: { id: bot.id } } },
            { user: { connect: { id: firstUser.id } } },
          ],
        },
      },
    });

    await prisma.message.create({
      data: {
        content: 'Hello! I am your AI logistics assistant. Ask me anything about shipments or tracking.',
        senderId: bot.id,
        conversationId: conversation.id,
        isAI: true,
      },
    });
  }

  console.log('[Seed] Seeding completed.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
