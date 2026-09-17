import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user if not exists
  const adminExists = await prisma.adminUser.findUnique({
    where: { email: 'admin@voting.local' }
  });

  if (!adminExists) {
    // Default password: Admin123!
    await prisma.adminUser.create({
      data: {
        name: 'Admin',
        email: 'admin@voting.local',
        passwordHash: 'Admin123!',
        role: 'admin'
      }
    });
    console.log('✅ Created admin user: admin@voting.local / Admin123!');
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  // Create sample categories if needed
  const categoriesCount = await prisma.category.count();
  if (categoriesCount === 0) {
    const musicCategory = await prisma.category.create({
      data: {
        name: 'Music',
        description: 'Best Music Performance',
        isActive: true,
        activeFlag: true
      }
    });
    
    const dramaCategory = await prisma.category.create({
      data: {
        name: 'Drama',
        description: 'Best Drama Performance',
        isActive: true,
        activeFlag: true
      }
    });
    
    const comedyCategory = await prisma.category.create({
      data: {
        name: 'Comedy',
        description: 'Best Comedy',
        isActive: true,
        activeFlag: true
      }
    });

    // Create sample contestants with correct category IDs
    await prisma.candidate.createMany({
      data: [
        { name: 'John Doe', code: 'MUSIC001', bio: 'Amazing vocalist', categoryId: musicCategory.id, votesCount: 0 },
        { name: 'Jane Smith', code: 'MUSIC002', bio: 'Talented singer', categoryId: musicCategory.id, votesCount: 0 },
        { name: 'Sauti Sol', code: 'MUSIC003', bio: 'Kenyan superband', categoryId: musicCategory.id, votesCount: 0 },
        { name: 'Mike Brown', code: 'DRAMA001', bio: 'Great actor', categoryId: dramaCategory.id, votesCount: 0 },
        { name: 'Sarah Wilson', code: 'DRAMA002', bio: 'Excellent actress', categoryId: dramaCategory.id, votesCount: 0 },
        { name: 'Kennedy Mumo', code: 'DRAMA003', bio: 'Kenyan thespian', categoryId: dramaCategory.id, votesCount: 0 },
        { name: 'Tom Clark', code: 'COMEDY001', bio: 'Funny comedian', categoryId: comedyCategory.id, votesCount: 0 },
        { name: 'Lisa Lee', code: 'COMEDY002', bio: 'Hilarious performer', categoryId: comedyCategory.id, votesCount: 0 },
        { name: 'Terry G', code: 'COMEDY003', bio: 'Kenyan funny man', categoryId: comedyCategory.id, votesCount: 0 },
      ]
    });
    console.log('✅ Created sample categories and contestants');
  } else {
    console.log('ℹ️ Categories already exist');
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
