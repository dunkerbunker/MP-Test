// scripts/checkModels.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Available models on Prisma Client:');
  console.log(Object.getOwnPropertyNames(prisma).filter((prop) => !prop.startsWith('_')));
}

main()
  .catch((e) => {
    console.error('Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
