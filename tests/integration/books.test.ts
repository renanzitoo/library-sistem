import request from 'supertest';
import { app } from '../../src/index';
import { testBooks } from '../fixtures/books';
import { createAdminUserAndGetToken, createRegularUserAndGetToken } from '../helpers/auth.helper';
import prisma from '../../src/config/prisma';

describe('Books Integration Tests', () => {
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
    adminToken = (await createAdminUserAndGetToken()).token;
    userToken = (await createRegularUserAndGetToken()).token;
  });

  describe('POST /books', () => {
    it('should create a book (admin)', async () => {
      const bookData = testBooks.book1;
      const createdBook = { id: 'some-uuid', ...bookData };

      (prisma.book.create as jest.Mock).mockResolvedValue(createdBook);

      const res = await request(app)
        .post('/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bookData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(bookData.title);
      expect(res.body.author).toBe(bookData.author);
      expect(res.body.stock).toBe(bookData.stock); 

      expect(prisma.book.create).toHaveBeenCalledWith({ data: bookData });
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
      const books = [{ ...testBooks.book1, id: 'book1-id' }, { ...testBooks.book2, id: 'book2-id' }];
      (prisma.book.findMany as jest.Mock).mockResolvedValue(books);

      const res = await request(app)
        .get('/books')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('title');
      expect(prisma.book.findMany).toHaveBeenCalledTimes(1);
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/books');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /books/search', () => {
    it('should search books by title', async () => {
      const books = [{ ...testBooks.book1, id: 'book1-id' }];
      (prisma.book.findMany as jest.Mock).mockResolvedValue(books);

      const res = await request(app)
        .get('/books/search?q=Clean')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toContain('Clean');
      expect(prisma.book.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'Clean', mode: 'insensitive' } },
            { author: { contains: 'Clean', mode: 'insensitive' } }
          ]
        }
      });
    });

    it('should search books by author', async () => {
      const books = [{ ...testBooks.book1, id: 'book1-id' }];
      (prisma.book.findMany as jest.Mock).mockResolvedValue(books);

      const res = await request(app)
        .get('/books/search?q=Robert')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].author).toContain('Robert');
      expect(prisma.book.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'Robert', mode: 'insensitive' } },
            { author: { contains: 'Robert', mode: 'insensitive' } }
          ]
        }
      });
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
      const book = { id: 'some-uuid', ...testBooks.book1 };
      const updateData = { title: 'Clean Code Updated', author: 'Robert Martin', stock: 15 };
      const updatedBook = { ...book, ...updateData };

      (prisma.book.update as jest.Mock).mockResolvedValue(updatedBook);

      const res = await request(app)
        .put(`/books/${book.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe(updateData.title);
      expect(res.body.author).toBe(updateData.author);

      expect(prisma.book.update).toHaveBeenCalledWith({ where: { id: book.id }, data: updateData });
    });
  });

  describe('DELETE /books/:id', () => {
    it('should delete a book (admin)', async () => {
      const book = { id: 'some-uuid', ...testBooks.book1 };

      (prisma.book.delete as jest.Mock).mockResolvedValue(book);

      const res = await request(app)
        .delete(`/books/${book.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);

      expect(prisma.book.delete).toHaveBeenCalledWith({ where: { id: book.id } });
    });
  });
});