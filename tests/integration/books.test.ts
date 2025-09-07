import request from 'supertest';
import { app } from '../../src/index';
import { cleanDatabase, prisma } from '../setup';
import { testBooks } from '../fixtures/books';
import { createAdminUserAndGetToken, createRegularUserAndGetToken } from '../helpers/auth.helper';

describe('Books Integration Tests', () => {
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
    await cleanDatabase();
    
    const admin = await createAdminUserAndGetToken();
    const user = await createRegularUserAndGetToken();
    
    adminToken = admin.token;
    userToken = user.token;
  });

  describe('POST /books', () => {
    it('should create a book (admin)', async () => {
      const bookData = testBooks.book1;

      const res = await request(app)
        .post('/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bookData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(bookData.title);
      expect(res.body.author).toBe(bookData.author);
      expect(res.body.stock).toBe(1); 

      const bookInDb = await prisma.book.findUnique({
        where: { id: res.body.id },
      });
      expect(bookInDb).toBeTruthy();
      expect(bookInDb?.title).toBe(bookData.title);
    });

    it('should fail with insufficient permissions (user)', async () => {
      const res = await request(app)
        .post('/books')
        .set('Authorization', `Bearer ${userToken}`)
        .send(testBooks.book1);

      expect(res.status).toBe(403);
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .post('/books')
        .send(testBooks.book1);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /books', () => {
    it('should list books', async () => {
      await prisma.book.create({ data: testBooks.book1 });
      await prisma.book.create({ data: testBooks.book2 });

      const res = await request(app)
        .get('/books')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('title');
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/books');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /books/search', () => {
    it('should search books by title', async () => {
      await prisma.book.create({ data: testBooks.book1 });
      await prisma.book.create({ data: testBooks.book2 });

      const res = await request(app)
        .get('/books/search?q=Clean')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toContain('Clean');
    });

    it('should search books by author', async () => {
      await prisma.book.create({ data: testBooks.book1 });

      const res = await request(app)
        .get('/books/search?q=Robert')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].author).toContain('Robert');
    });

    it('should fail without query parameter', async () => {
      const res = await request(app)
        .get('/books/search')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /books/:id', () => {
    it('should update a book (admin)', async () => {
      const book = await prisma.book.create({ data: testBooks.book1 });
      const updateData = { title: 'Clean Code Updated', author: 'Robert Martin' };

      const res = await request(app)
        .put(`/books/${book.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe(updateData.title);
      expect(res.body.author).toBe(updateData.author);

      const updatedBook = await prisma.book.findUnique({
        where: { id: book.id },
      });
      expect(updatedBook?.title).toBe(updateData.title);
    });
  });

  describe('DELETE /books/:id', () => {
    it('should delete a book (admin)', async () => {
      const book = await prisma.book.create({ data: testBooks.book1 });

      const res = await request(app)
        .delete(`/books/${book.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);

      const deletedBook = await prisma.book.findUnique({
        where: { id: book.id },
      });
      expect(deletedBook).toBeNull();
    });
  });
});