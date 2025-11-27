import { Request, Response } from "express";
import User from "../models/user.models";
import bcrypt from "bcrypt";

export const registerController = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({ email, password: hashedPassword, role });

  res.status(201).json({ message: "User created successfully", user });
};

export const login = async () => {
  try {
  } catch (error) {
    console.log("error :>> ", error);
  }
};
