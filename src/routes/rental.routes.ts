import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import * as rentalController from "../controllers/rental.controller";

const router = Router();

router.post("/rent", authenticate, rentalController.rentBook);
router.post("/return", authenticate, rentalController.returnBook);
router.get("/my", authenticate, rentalController.listUserRentals);

export default router;
