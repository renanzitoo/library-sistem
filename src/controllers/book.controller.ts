import type { Request, Response } from "express";
import * as bookService from "../services/book.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getBooks = async (req: Request, res: Response) => {
  const books = await bookService.getBooks();
  res.json(books);
};  

export const getBookById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const book = await bookService.getBookById(String(id));
}

export const addBook = async (req: Request, res: Response) => {
  const { title, author, stock } = req.body;
  const book = await bookService.addBook(title, author, stock);
  res.status(201).json(book);
};

export const searchBooks = async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }
  const books = await bookService.searchBooks(q);
  res.json(books);
};

export const updateBook = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, author, stock} = req.body;
  const book = await bookService.updateBook(String(id), title, author, stock);
  res.json(book);
};

export const deleteBook = async (req: Request, res: Response) => {
  const { id } = req.params;
  await bookService.deleteBook(String(id));
  res.status(204).send();
};

export const rentBook = async (req: AuthRequest, res: Response) => {
  const { bookId } = req.body;
  const rental = await bookService.rentBook(String(bookId), String(req.user!.id));
  res.json(rental);
};

export const returnBook = async (req: Request, res: Response) => {
  const { rentalId } = req.body;
  const rental = await bookService.returnBook(String(rentalId));
  res.json(rental);
};
