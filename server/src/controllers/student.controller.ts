import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.models";
import { generateBarcode } from "../lib/generateBarcode";

const allowedGrades = new Set([
  "6-1",
  "7-1",
  "7-2",
  "8-1",
  "8-2",
  "9-1",
  "10-1",
  "10-2",
  "11-1",
  "11-2",
  "12",
]);

async function verifyAdminPassword(req: Request, inputPassword: string) {
  const adminId = req.user?.id;
  if (!adminId) return false;

  const admin = await User.findById(adminId);
  if (!admin) return false;
  if (admin.role !== "admin") return false;
  if (!admin.password) return false;

  return await bcrypt.compare(inputPassword, admin.password);
}

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { name, grade } = req.body as { name?: string; grade?: string | number };

    const gradeStr = String(grade ?? "").trim();
    if (!name || !gradeStr || !allowedGrades.has(gradeStr)) {
      return res.status(400).json({
        message: "Invalid name or grade",
        allowedGrades: Array.from(allowedGrades),
      });
    }

    // ensure barcode uniqueness (retry a few times)
    let barcode = generateBarcode();
    for (let i = 0; i < 5; i++) {
      const exists = await User.exists({ barcode });
      if (!exists) break;
      barcode = generateBarcode();
    }

    const student = await User.create({
      name,
      grade: gradeStr,
      role: "user",
      barcode,
    });

    res.status(201).json({
      message: "Student created",
      student: {
        _id: student._id,
        name: student.name,
        grade: student.grade,
        barcode: student.barcode,
        role: student.role,
        createdAt: student.createdAt,
      },
    });
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Duplicate value", details: err?.keyValue });
    }
    res.status(500).json({ message: "Failed to create student" });
  }
};

export const listStudents = async (req: Request, res: Response) => {
  try {
    const { grade } = req.query as { grade?: string };
    const filter: any = { role: "user" };
    if (grade) {
      const gradeStr = String(grade).trim();
      // front-end currently sends grade=6/7/8/9/10/11/12; support both styles
      if (/^(6|7|8|9|10|11)$/.test(gradeStr)) {
        filter.grade = new RegExp(`^${gradeStr}-`);
      } else if (gradeStr === "12") {
        filter.grade = "12";
      } else if (allowedGrades.has(gradeStr)) {
        filter.grade = gradeStr;
      } else {
        return res.status(400).json({
          message: "Invalid grade filter",
          allowedGrades: Array.from(allowedGrades),
        });
      }
    }

    const students = await User.find(filter)
      .select("name grade barcode role createdAt")
      .sort({ createdAt: -1 });

    res.json(students);
  } catch {
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { inputPassword } = req.body as { inputPassword?: string };
    if (!inputPassword) return res.status(400).json({ message: "Password required" });

    const ok = await verifyAdminPassword(req, inputPassword);
    if (!ok) return res.status(403).json({ message: "Invalid admin password" });

    const student = await User.findOneAndDelete({ _id: req.params.id, role: "user" });
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json({ message: "Student deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete student" });
  }
};

export const bulkDeleteStudents = async (req: Request, res: Response) => {
  try {
    const { inputPassword, ids, all } = req.body as {
      inputPassword?: string;
      ids?: string[];
      all?: boolean;
    };

    if (!inputPassword) return res.status(400).json({ message: "Password required" });
    const ok = await verifyAdminPassword(req, inputPassword);
    if (!ok) return res.status(403).json({ message: "Invalid admin password" });

    if (all) {
      const result = await User.deleteMany({ role: "user" });
      return res.json({ message: "All students deleted", deletedCount: result.deletedCount });
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "ids[] required (or all=true)" });
    }

    const result = await User.deleteMany({ role: "user", _id: { $in: ids } });
    res.json({ message: "Students deleted", deletedCount: result.deletedCount });
  } catch {
    res.status(500).json({ message: "Failed to bulk delete students" });
  }
};

