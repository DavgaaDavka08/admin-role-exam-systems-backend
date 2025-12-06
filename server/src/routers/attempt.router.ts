// routers/attempt.router.ts
import { Router } from "express";
import {
  startAttempt,
  saveAnswer,
  submitAttempt,
  getAttemptById,
  getAttemptsByExam,
} from "../controllers/attempt.controller";

const router = Router();

router.post("/start", startAttempt);
router.post("/answer", saveAnswer);
router.post("/submit", submitAttempt);

// ✔ Нэг attempt-ийг id-аар авах
router.get("/single/:id", getAttemptById);

// ✔ Нэг шалгалтын бүх attempts (analytics)

router.get("/exam/:examId", getAttemptsByExam);

export default router;
