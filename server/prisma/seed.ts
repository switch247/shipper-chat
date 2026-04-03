import "dotenv/config";
import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('[Seed] Seeding database...');

  // 1. Create AI Bot user
  const bot = await prisma.user.upsert({
    where: { email: 'ai-assistant@shipper-chat.com' },
    update: {},
    create: {
      id: 'bot-assistant',
      name: 'Shipper Bot',
      email: 'ai-assistant@shipper-chat.com',
      isBot: true,
      status: 'ONLINE',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Shipper'
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
    { id: '8', name: 'You', email: 'abel@example.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop', status: 'ONLINE' },
  ];

  // Legacy seeded password used previously
  const LEGACY_SEED_PASSWORD = 'Password!123';
  const hashedSeedPassword = await bcrypt.hash(LEGACY_SEED_PASSWORD, 10);

  for (const u of seedUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        avatar: u.avatar,
        status: u.status as any,
        password: hashedSeedPassword,
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        status: u.status as any,
        password: hashedSeedPassword,
      },
    });
  }

  // 3. Create a conversation between bot and the first seeded user with a welcome message
  const firstSeedUser = seedUsers[0];
  const firstUser = await prisma.user.findUnique({ where: { email: firstSeedUser.email } });
  if (firstUser) {
    const [a, b] = [bot.id, firstUser.id].sort();
    const conversation = await prisma.conversation.create({
      data: {
        isGroup: false,
        userAId: a,
        userBId: b,
      },
    });

    await prisma.message.create({
      data: {
        content: 'Hello! I am Shipper Bot — your friendly assistant and companion for shipping and logistics. How can I help you today?',
        senderId: bot.id,
        conversationId: conversation.id,
        isAI: true,
      },
    });
  }

  // 4. Create one-on-one conversations between current user and mock users with sample messages
  const me = await prisma.user.findUnique({ where: { email: 'abel@example.com' } });
  const otherEmails = ['adrian@example.com', 'yomi@example.com', 'bianca@example.com', 'palmer@example.com', 'yuki@example.com', 'daniel@example.com'];

  for (const email of otherEmails) {
    const other = await prisma.user.findUnique({ where: { email } });
    if (!other || !me) continue;

    const [a, b] = [me.id, other.id].sort();

    // Check if conversation between the two already exists
    const existing = await prisma.conversation.findFirst({ where: { isGroup: false, userAId: a, userBId: b } });
    if (existing) continue;

    const conv = await prisma.conversation.create({ data: { isGroup: false, userAId: a, userBId: b } });

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
    // Add a couple more messages with mixed read states to simulate two-way and unread
    await prisma.message.create({
      data: {
        content: `Are you available for a quick call today?`,
        senderId: other.id,
        conversationId: conv.id,
        read: false,
      },
    });

    await prisma.message.create({
      data: {
        content: `Sure — give me 10 minutes.`,
        senderId: me.id,
        conversationId: conv.id,
        read: true,
        readAt: new Date(),
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
