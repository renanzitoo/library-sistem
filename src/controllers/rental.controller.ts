import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import * as rentalService from "../services/rental.service";

export const rentBook = async (req: AuthRequest, res: Response) => {
  try {
    const { bookId } = req.body;
    const rental = await rentalService.rentBook(String(req.user!.id), bookId);
    res.status(201).json(rental);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const returnBook = async (req: AuthRequest, res: Response) => {
  try {
    const { rentalId } = req.body;
    const rental = await rentalService.returnBook(rentalId, String(req.user!.id));
    res.json(rental);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const listUserRentals = async (req: AuthRequest, res: Response) => {
  try {
    const rentals = await rentalService.listUserRentals(String(req.user!.id));
    res.json(rentals);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
