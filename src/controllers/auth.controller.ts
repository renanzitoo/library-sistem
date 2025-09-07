import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    if (!email.includes('@')) {
      return res.status(400).json({ message: 'Invalid email' });
    }
    
    const user = await authService.register(name, email, password);
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const { token, user } = await authService.login(email, password);
    res.json({ token, user });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};
