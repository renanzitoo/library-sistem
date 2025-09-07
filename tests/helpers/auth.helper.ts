import request from 'supertest';
import { app } from '../../src/index';
import { prisma } from '../setup';

export const createUserAndGetToken = async (userData: any) => {
  const registerRes = await request(app)
    .post('/auth/register')
    .send(userData);

  if (registerRes.status !== 201) {
    throw new Error(`Failed to register user: ${registerRes.body.message}`);
  }

  if (userData.role === 'ADMIN') {
    await prisma.user.update({
      where: { id: registerRes.body.id },
      data: { role: 'ADMIN' }
    });
  }

  const loginRes = await request(app)
    .post('/auth/login')
    .send({
      email: userData.email,
      password: userData.password,
    });

  if (loginRes.status !== 200) {
    throw new Error(`Failed to login: ${loginRes.body.message}`);
  }

  return {
    user: registerRes.body,
    token: loginRes.body.token,
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