import request from 'supertest';
import { app } from '../../src/index';
import { testBooks } from '../fixtures/books';
import { createAdminUserAndGetToken, createRegularUserAndGetToken } from '../helpers/auth.helper';
import { User } from '@prisma/client';
import prisma from '../../src/config/prisma';

describe('Rental Integration Tests', () => {
  let admin: { user: User; token: string };
  let user: { user: User; token: string };

  beforeEach(async () => {
    admin = await createAdminUserAndGetToken();
    user = await createRegularUserAndGetToken();
  });

  describe('POST /rentals/rent', () => {
    it('should rent a book', async () => {
      const book = { ...testBooks.book1, id: 'some-book-id', stock: testBooks.book1.stock };
      const rental = { id: 'some-rental-id', userId: user.user.id, bookId: book.id, rentedAt: new Date(), returned: false };

      (prisma.book.findUnique as jest.Mock).mockResolvedValue(book);
      (prisma.book.update as jest.Mock).mockResolvedValue({ ...book, stock: book.stock - 1 });
      (prisma.rental.create as jest.Mock).mockResolvedValue(rental);

      const res = await request(app)
        .post('/rentals/rent')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ bookId: book.id });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.bookId).toBe(book.id);
      expect(res.body.userId).toBe(user.user.id);

      expect(prisma.book.findUnique).toHaveBeenCalledWith({ where: { id: book.id } });
      expect(prisma.book.update).toHaveBeenCalledWith({ where: { id: book.id }, data: { stock: { decrement: 1 } } });
      expect(prisma.rental.create).toHaveBeenCalledWith({ data: { userId: user.user.id, bookId: book.id } });
    });
  });

  describe('POST /rentals/return', () => {
    it('should return a rented book', async () => {
      const book = { ...testBooks.book1, id: 'some-book-id', stock: testBooks.book1.stock - 1 };
      const rental = { id: 'some-rental-id', userId: user.user.id, bookId: book.id, rentedAt: new Date(), returned: false };

      (prisma.rental.findUnique as jest.Mock).mockResolvedValue(rental);
      (prisma.rental.update as jest.Mock).mockResolvedValue({ ...rental, returned: true });
      (prisma.book.update as jest.Mock).mockResolvedValue({ ...book, stock: book.stock + 1 });

      const res = await request(app)
        .post('/rentals/return')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ rentalId: rental.id });

      expect(res.status).toBe(200);
      expect(res.body.returned).toBe(true);

      expect(prisma.rental.findUnique).toHaveBeenCalledWith({ where: { id: rental.id } });
      expect(prisma.rental.update).toHaveBeenCalledWith({ where: { id: rental.id }, data: { returned: true } });
      expect(prisma.book.update).toHaveBeenCalledWith({ where: { id: book.id }, data: { stock: { increment: 1 } } });
    });
  });

  describe('GET /rentals', () => {
    it('should list user rentals', async () => {
      const book1 = { ...testBooks.book1, id: 'book1-id', title: `Clean Code ${Math.random()}` };
      const book2 = { ...testBooks.book2, id: 'book2-id', title: `The Pragmatic Programmer ${Math.random()}` };
      const rental1 = { id: 'rental1-id', userId: user.user.id, bookId: book1.id, rentedAt: new Date(), returned: false, book: book1 };
      const rental2 = { id: 'rental2-id', userId: user.user.id, bookId: book2.id, rentedAt: new Date(), returned: false, book: book2 };

      (prisma.rental.findMany as jest.Mock).mockResolvedValue([rental1, rental2]);

      const res = await request(app)
        .get('/rentals/my')
        .set('Authorization', `Bearer ${user.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty('book');
      expect(res.body[0].book.title).toBe(book1.title);
      expect(prisma.rental.findMany).toHaveBeenCalledWith({ where: { userId: user.user.id }, include: { book: true } });
    });
  });
});