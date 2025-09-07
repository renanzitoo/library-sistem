import { Router } from "express";
import * as bookController from "../controllers/book.controller";
import { authenticate, isAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, bookController.getBooks);
router.get("/search", authenticate, bookController.searchBooks);
router.post("/rent", authenticate, bookController.rentBook);
router.post("/return", authenticate, bookController.returnBook);

router.post("/", authenticate, isAdmin, bookController.addBook);
router.put("/:id", authenticate, isAdmin, bookController.updateBook);
router.delete("/:id", authenticate, isAdmin, bookController.deleteBook);

export default router;
