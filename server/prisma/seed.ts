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
  // Add users matching client mock data (ids kept to match client mocks)
  const seedUsers = [
    { id: '1', name: 'Adrian Kurt', email: 'adrian@example.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', status: 'ONLINE' },
    { id: '2', name: 'Yomi Immanuel', email: 'yomi@example.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', status: 'ONLINE' },
    { id: '3', name: 'Bianca Nubia', email: 'bianca@example.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop', status: 'OFFLINE' },
    { id: '5', name: 'Palmer Dian', email: 'palmer@example.com', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop', status: 'ONLINE' },
    { id: '6', name: 'Yuki Tanaka', email: 'yuki@example.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', status: 'OFFLINE' },
    { id: '7', name: 'Daniel CH', email: 'daniel@example.com', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop', status: 'ONLINE' },
    // current user
    { id: 'current-user', name: 'You', email: 'you@example.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop', status: 'ONLINE' },
  ];

  for (const u of seedUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        avatar: u.avatar,
        status: u.status as any,
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        status: u.status as any,
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

  // 4. Create one-on-one conversations between current user and mock users with sample messages
  const me = await prisma.user.findUnique({ where: { email: 'you@example.com' } });
  const otherEmails = ['adrian@example.com', 'yomi@example.com', 'bianca@example.com', 'palmer@example.com', 'yuki@example.com', 'daniel@example.com'];

  for (const email of otherEmails) {
    const other = await prisma.user.findUnique({ where: { email } });
    if (!other || !me) continue;

    // Check if conversation between the two already exists
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: other.id } } },
          { participants: { some: { userId: me.id } } },
        ],
      },
    });

    if (existing) continue;

    const conv = await prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { user: { connect: { id: me.id } } },
            { user: { connect: { id: other.id } } },
          ],
        },
      },
    });

    await prisma.message.createMany({
      data: [
        {
          content: `Hi ${other.name}, this is ${me.name}.`,
          senderId: me.id,
          conversationId: conv.id,
        },
        {
          content: `Hey ${me.name}, got your message — I'll get back to you shortly.`,
          senderId: other.id,
          conversationId: conv.id,
        },
      ],
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
