import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'test') {
  const prismaMock = require('./prisma.mock');
  prisma = prismaMock.default;
} else {
  prisma = new PrismaClient();
}

export default prisma;
