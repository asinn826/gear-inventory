import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
  console.log('Running database migrations...');
  
  // Run Prisma migrations
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Migrations applied successfully!');
  } catch (error) {
    console.error('Error applying migrations:', error);
    process.exit(1);
  }
  
  // Optional: Run seed script if it exists
  try {
    execSync('npx ts-node prisma/seed.ts', { stdio: 'inherit' });
    console.log('Database seeded successfully!');
  } catch (error) {
    console.log('No seed script found or error running seed script');
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Migration process completed.');
  });
