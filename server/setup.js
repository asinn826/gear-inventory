// setup.js - Script to explicitly generate Prisma client
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Prisma setup script...');

// Ensure the prisma directory exists
const prismaDir = path.join(__dirname, 'prisma');
if (!fs.existsSync(prismaDir)) {
  console.log('Creating prisma directory...');
  fs.mkdirSync(prismaDir, { recursive: true });
}

// Create a minimal schema if none exists
const schemaPath = path.join(prismaDir, 'schema.prisma');
if (!fs.existsSync(schemaPath)) {
  console.log('Creating minimal schema.prisma...');
  const minimalSchema = `
// Minimal schema for Prisma client generation
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Item {
  id          String   @id @default(uuid())
  name        String
  description String?
  quantity    Int      @default(1)
  isConsumable Boolean  @default(false)
  link        String?
  tags        Tag[]    @relation("ItemTags")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Tag {
  id    String @id @default(uuid())
  name  String @unique
  items Item[]  @relation("ItemTags")
}
`;
  fs.writeFileSync(schemaPath, minimalSchema, 'utf8');
}

try {
  // First, ensure prisma is installed
  console.log('Installing Prisma CLI...');
  execSync('npm install prisma --no-save', { stdio: 'inherit' });

  // Run prisma generate
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('Prisma setup completed successfully!');
} catch (error) {
  console.error('Error during Prisma setup:', error);
  process.exit(1);
}