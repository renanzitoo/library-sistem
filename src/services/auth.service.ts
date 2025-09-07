import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (name: string, email: string, password: string, role: "ADMIN" | "USER" = "USER") => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
  });

  return user;
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid password");

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "1h" }
  );

  return { token, user };
};
