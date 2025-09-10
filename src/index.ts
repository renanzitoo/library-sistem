import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bookRoutes from "./routes/books.routes";
import authRoutes from "./routes/auth.routes";
import rentalRoutes from "./routes/rental.routes";

dotenv.config();
export const app = express();
app.use(cors());

app.use(express.json());
app.use("/books", bookRoutes);
app.use("/auth", authRoutes);
app.use("/rentals", rentalRoutes);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}
