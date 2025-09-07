import prisma from "../config/prisma";

export const getBooks = () => prisma.book.findMany();

export const getBookById = (id: string) => prisma.book.findUnique({ where: { id } });

export const addBook = (title: string, author: string) =>
  prisma.book.create({ data: { title, author } });

export const updateBook = (id: string, title: string, author: string) =>
  prisma.book.update({ where: { id }, data: { title, author } });

export const searchBooks = (query: string) =>
  prisma.book.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { author: { contains: query, mode: 'insensitive' } }
      ]
    }
  });

export const deleteBook = (id: string) =>
  prisma.book.delete({ where: { id } });

export const rentBook = async (bookId: string, userId: string) => {
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book || book.stock < 1) throw new Error("Unavailable book");

  await prisma.book.update({ where: { id: bookId }, data: { stock: { decrement: 1 } } });
  return prisma.rental.create({ data: { bookId, userId } });
};

export const returnBook = async (rentalId: string) => {
  const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
  if (!rental) throw new Error("Rental not found");

  await prisma.book.update({ where: { id: rental.bookId }, data: { stock: { increment: 1 } } });
  return prisma.rental.update({ where: { id: rentalId }, data: { returned: true } });
};
