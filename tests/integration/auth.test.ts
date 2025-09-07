import request from 'supertest';
import { app } from '../../src/index';
import { cleanDatabase, prisma } from '../setup';
import { testUsers } from '../fixtures/users';

describe('Auth Integration Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /auth/register', () => {
    it('should register an user', async () => {
      const userData = {
        ...testUsers.user1,
        email: `test${Date.now()}@example.com`, 
      };

      const res = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(userData.email);
      expect(res.body.name).toBe(userData.name);
      expect(res.body.role).toBe('USER');
      expect(res.body).not.toHaveProperty('password'); 

      const userInDb = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(userInDb).toBeTruthy();
      expect(userInDb?.name).toBe(userData.name);
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        ...testUsers.user1,
        email: 'duplicate@test.com',
      };

      await request(app).post('/auth/register').send(userData);

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

      await request(app).post('/auth/register').send(userData);

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
    });

    it('should fail with non-existent email', async () => {
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

      await request(app).post('/auth/register').send(userData);

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