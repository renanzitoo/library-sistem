import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// This is a mock PrismaClient that can be used in tests.
// It allows you to mock the behavior of the PrismaClient methods.
// For example, you can mock `prisma.user.findUnique` to return a specific user.

const prisma = mockDeep<PrismaClient>();

// Reset the mock before each test
beforeEach(() => {
  mockReset(prisma);
});

export default prisma as unknown as DeepMockProxy<PrismaClient>;