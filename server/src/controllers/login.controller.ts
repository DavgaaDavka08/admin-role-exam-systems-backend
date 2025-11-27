import { Request, Response } from "express";
import { existingEmail } from "../lib/exist.email";
import { ComparePassword } from "../lib/exist.password";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await existingEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const passwordIsCorrect = await ComparePassword(password, user.password);
    if (!passwordIsCorrect) {
      return res.status(401).json({ message: "password is correct" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.log("error :>> ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
