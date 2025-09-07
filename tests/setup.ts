import { PrismaClient } from '@prisma/client';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

const prisma = new PrismaClient();

export const cleanDatabase = async () => {
  await prisma.rental.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();
};

beforeAll(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await cleanDatabase();
  await prisma.$disconnect();
});

export { prisma };