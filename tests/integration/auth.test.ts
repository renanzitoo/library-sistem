import request from 'supertest';
import { app } from '../../src/index';
import { testUsers } from '../fixtures/users';
import prisma from '../../src/config/prisma';
import bcrypt from 'bcrypt';

describe('Auth Integration Tests', () => {

  describe('POST /auth/register', () => {
    it('should register an user', async () => {
      const userData = {
        ...testUsers.user1,
        email: `test${Date.now()}@example.com`, 
      };
      const createdUser = { id: 'some-uuid', ...userData, role: 'USER' };

      (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);

      const res = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(userData.email);
      expect(res.body.name).toBe(userData.name);
      expect(res.body.role).toBe('USER');
      expect(res.body).not.toHaveProperty('password'); 

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: userData.email,
          name: userData.name,
        }),
      });
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        ...testUsers.user1,
        email: 'duplicate@test.com',
      };

      (prisma.user.create as jest.Mock).mockRejectedValue(new Error('Unique constraint failed'));

      const res = await request(app).post('/auth/register').send(userData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail with invalid data', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: '',
          email: 'invalid-email',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'not-an-email',
          password: '123456',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail with short password', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const userData = {
        ...testUsers.user1,
        email: `login${Date.now()}@test.com`,
      };
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userInDb = { id: 'some-uuid', ...userData, password: hashedPassword, role: 'USER' };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(userInDb);

      const res = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(userData.email);
      expect(typeof res.body.token).toBe('string');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: userData.email } });
    });

    it('should fail with non-existent email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'naoexiste@test.com',
          password: '123456',
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail with invalid password', async () => {
      const userData = {
        ...testUsers.user1,
        email: `wrongpass${Date.now()}@test.com`,
      };
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const userInDb = { id: 'some-uuid', ...userData, password: hashedPassword, role: 'USER' };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(userInDb);

      const res = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: 'senhaerrada',
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
  });
});