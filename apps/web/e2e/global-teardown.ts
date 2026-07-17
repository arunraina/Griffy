import { prisma } from './helpers';

export default async function globalTeardown() {
  await prisma.$disconnect();
}
