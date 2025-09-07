import prisma from "../config/prisma";

export const rentBook = async (userId: string, bookId: number) => {
  const book = await prisma.book.findUnique({ where: { id: String(bookId) } });
  if (!book) throw new Error("Book not found");
  if (book.stock < 1) throw new Error("Book unavailable");


  const rental = await prisma.rental.create({
    data: { userId, bookId: String(bookId) },
  });

  await prisma.book.update({
    where: { id: String(bookId) },
    data: { stock: { decrement: 1 } },
  });

  return rental;
};

export const returnBook = async (rentalId: string, userId: string) => {
  const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
  if (!rental) throw new Error("Rental not found");
  if (rental.userId !== userId) throw new Error("Unauthorized");
  if (rental.returned) throw new Error("Rental already returned");

  const updatedRental = await prisma.rental.update({
    where: { id: rentalId },
    data: { returned: true },
  });

  await prisma.book.update({
    where: { id: rental.bookId },
    data: { stock: { increment: 1 } },
  });

  return updatedRental;
};

export const listUserRentals = async (userId: string) => {
  return prisma.rental.findMany({
    where: { userId },
    include: { book: true },
  });
};
