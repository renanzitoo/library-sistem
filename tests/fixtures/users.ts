export const testUsers = {
  user1: {
    name: 'João Silva',
    email: 'joao@test.com',
    password: '123456',
    role: 'USER' as const,
  },
  admin1: {
    name: 'Admin User',
    email: 'admin@test.com',
    password: '123456',
    role: 'ADMIN' as const,
  },
};