import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.item.deleteMany({});
  await prisma.tag.deleteMany({});

  console.log('✅ Database cleared');

  // Create some tags
  const tags = ['Camping', 'Hiking', 'Cooking', 'Sleeping', 'Essentials'];
  
  const createdTags = await Promise.all(
    tags.map(name => 
      prisma.tag.create({
        data: { name }
      })
    )
  );

  console.log(`✅ Created ${createdTags.length} tags`);

  // Create some sample gear items
  const items = [
    {
      name: 'Tent',
      description: '2-person backpacking tent',
      quantity: 1,
      isConsumable: false,
      tags: ['Camping', 'Essentials']
    },
    {
      name: 'Sleeping Bag',
      description: '20°F down sleeping bag',
      quantity: 1,
      isConsumable: false,
      tags: ['Camping', 'Sleeping', 'Essentials']
    },
    {
      name: 'Camp Stove',
      description: 'Portable gas camping stove',
      quantity: 1,
      isConsumable: false,
      tags: ['Camping', 'Cooking']
    },
    {
      name: 'Hiking Boots',
      description: 'Waterproof hiking boots',
      quantity: 1,
      isConsumable: false,
      tags: ['Hiking', 'Essentials']
    },
    {
      name: 'Water Filter',
      description: 'Portable water filtration system',
      quantity: 1,
      isConsumable: false,
      tags: ['Hiking', 'Essentials']
    },
    {
      name: 'Propane Canister',
      description: '8oz propane canister for camp stove',
      quantity: 2,
      isConsumable: true,
      tags: ['Camping', 'Cooking']
    },
    {
      name: 'Headlamp',
      description: 'LED headlamp with red light mode',
      quantity: 2,
      isConsumable: false,
      tags: ['Camping', 'Hiking', 'Essentials']
    },
    {
      name: 'First Aid Kit',
      description: 'Compact first aid kit',
      quantity: 1,
      isConsumable: true,
      tags: ['Essentials']
    },
    {
      name: 'Camp Chair',
      description: 'Lightweight folding camp chair',
      quantity: 2,
      isConsumable: false,
      tags: ['Camping']
    },
    {
      name: 'Water Bottles',
      description: '1L reusable water bottles',
      quantity: 4,
      isConsumable: false,
      tags: ['Hiking', 'Essentials']
    }
  ];

  for (const itemData of items) {
    const { tags: tagNames, ...item } = itemData;
    
    await prisma.item.create({
      data: {
        ...item,
        tags: {
          connectOrCreate: tagNames.map(tagName => ({
            where: { name: tagName },
            create: { name: tagName },
          })),
        },
      },
    });
  }

  console.log(`✅ Created ${items.length} gear items`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🌱 Database seeding completed!');
  });
