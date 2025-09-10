import prisma from '../../src/config/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const createUserAndGetToken = async (userData: any) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const createdUser = { id: 'some-uuid', ...userData, password: hashedPassword };

  (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);
  (prisma.user.findUnique as jest.Mock).mockResolvedValue(createdUser);

  const token = jwt.sign({ id: createdUser.id, role: createdUser.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

  return {
    user: createdUser,
    token,
  };
};

export const createAdminUserAndGetToken = async () => {
  const adminData = {
    name: 'Admin Test',
    email: `admin${Date.now()}@test.com`,
    password: '123456',
    role: 'ADMIN', 
  };

  return await createUserAndGetToken(adminData);
};

export const createRegularUserAndGetToken = async () => {
  const userData = {
    name: 'User Test',
    email: `user${Date.now()}@test.com`,
    password: '123456',
    role: 'USER',
  };

  return await createUserAndGetToken(userData);
};