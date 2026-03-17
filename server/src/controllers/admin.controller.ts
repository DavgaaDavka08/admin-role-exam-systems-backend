import { Request, Response } from "express";
import User from "../models/user.models";
import { ComparePassword, HashPassword } from "../lib/exist.password";

export const changeAdminPassword = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const { oldPassword, newPassword, confirmPassword } = req.body as {
      oldPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Missing fields" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password too short" });
    }

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (!admin.password) {
      return res.status(400).json({ message: "Admin password missing" });
    }

    const ok = await ComparePassword(oldPassword, admin.password);
    if (!ok) return res.status(403).json({ message: "Old password incorrect" });

    admin.password = await HashPassword(newPassword);
    await admin.save();

    res.json({ message: "Password updated" });
  } catch {
    res.status(500).json({ message: "Failed to change password" });
  }
};

