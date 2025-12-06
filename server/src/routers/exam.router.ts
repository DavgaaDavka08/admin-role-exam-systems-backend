import { Router } from "express";
import { verifyToken } from "../middleware/verify.token";
import {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
} from "../controllers/exam.controller";

const router = Router();

router.post("/", verifyToken, createExam);
router.get("/", verifyToken, getExams);
router.get("/:id", verifyToken, getExamById);
router.put("/:id", verifyToken, updateExam);
router.delete("/:id", verifyToken, deleteExam);

export default router;
