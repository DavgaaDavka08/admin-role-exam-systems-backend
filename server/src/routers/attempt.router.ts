// routers/attempt.router.ts
import { Router } from "express";
import {
  startAttempt,
  saveAnswer,
  submitAttempt,
  getAttemptById,
  getAttemptsByExam,
  getAllAttempts,
} from "../controllers/attempt.controller";

const router = Router();

router.post("/start", startAttempt);
router.post("/answer", saveAnswer);
router.post("/submit", submitAttempt);
router.get("/single/:id", getAttemptById);
router.get("/exam/:examId", getAttemptsByExam);

router.get("/", getAllAttempts);
export default router;
