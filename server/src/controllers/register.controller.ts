import { Request, Response } from "express";
import User from "../models/user.models";
import { existingEmail } from "../lib/exist.email";
import { HashPassword } from "../lib/exist.password";

export const registerController = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  const existingUser = await existingEmail(email);

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  const hashPassword = await HashPassword(password);

  const user = await User.create({ email, password: hashPassword, role });

  res.status(201).json({ message: "User created successfully", user });
};

