// controllers/attempt.controller.ts
import { Request, Response } from "express";
import { Attempt } from "../models/attempt.model";
import { Exam } from "../models/exam.models";

/**
 * 1) Шалгалтыг эхлүүлэх
 *   - Хэрвээ өмнө нь SUBMITTED == true → буцаана (нэг удаа өгөх эрхтэй)
 *   - Хэрвээ дуусаагүй attempt байгаа → үргэлжлүүлнэ
 *   - Шинэ үүсгэнэ
 */
export const startAttempt = async (req: Request, res: Response) => {
  try {
    const { studentId, examId } = req.body;

    // 🔒 1. Хэрвээ өмнө нь бүрэн өгсөн бол → нэвтрүүлэхгүй
    const finished = await Attempt.findOne({
      studentId,
      examId,
      isSubmitted: true,
    });

    if (finished) {
      return res.status(400).json({
        message: "Та энэ шалгалтыг аль хэдийн нэг удаа өгсөн байна!",
        attemptId: finished._id,
      });
    }

    // 🔄 2. Өмнө нь эхлүүлсэн ч дуусаагүй attempt байгаа бол → шууд үргэлжлүүлнэ
    let attempt = await Attempt.findOne({
      studentId,
      examId,
      isSubmitted: false,
    });

    if (attempt) {
      return res.json(attempt);
    }

    // 🆕 3. Шинэ attempt үүсгэнэ
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    attempt = await Attempt.create({
      studentId,
      examId,
      answers: [],
      totalQuestions: exam.questions.length,
      isSubmitted: false,
    });

    return res.json(attempt);
  } catch (error) {
    console.error("Start attempt error:", error);
    res.status(500).json({ message: "Failed to start attempt" });
  }
};


/**
 * 2) Хариулт хадгалах
 */
export const saveAnswer = async (req: Request, res: Response) => {
  try {
    const { attemptId, questionId, selectedOption } = req.body;

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    if (attempt.isSubmitted) {
      return res
        .status(400)
        .json({ message: "Already submitted. Cannot change answers." });
    }

    const existing = attempt.answers.find((a) => a.questionId === questionId);

    if (existing) {
      existing.selectedOption = selectedOption;
    } else {
      attempt.answers.push({ questionId, selectedOption });
    }

    await attempt.save();
    res.json(attempt);
  } catch (error) {
    console.error("Save answer error:", error);
    res.status(500).json({ message: "Failed to save answer" });
  }
};


/**
 * 3) Шалгалт дуусгах (нэг удаа submit хийнэ)
 */
export const submitAttempt = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.body;

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    if (attempt.isSubmitted) {
      return res.status(400).json({
        message: "Шалгалт аль хэдийн дууссан байна! Дахин илгээх боломжгүй.",
      });
    }

    const exam = await Exam.findById(attempt.examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    let score = 0;

    exam.questions.forEach((q) => {
      const ans = attempt.answers.find((a) => a.questionId === q.id);
      if (ans && ans.selectedOption === q.correctAnswer) score++;
    });

    attempt.score = score;
    attempt.totalQuestions = exam.questions.length;
    attempt.isSubmitted = true;
    attempt.finishedAt = new Date();

    await attempt.save();

    return res.json({
      message: "Шалгалт амжилттай илгээгдлээ",
      score,
      total: exam.questions.length,
    });
  } catch (error) {
    console.error("Submit error:", error);
    res.status(500).json({ message: "Failed to submit attempt" });
  }
};


/**
 * 4) Attempt by ID
 */
export const getAttemptById = async (req: Request, res: Response) => {
  try {
    const attempt = await Attempt.findById(req.params.id).populate(
      "studentId",
      "name grade"
    );

    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    return res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


/**
 * 5) Get attempts for 1 exam (admin analytics)
 */
export const getAttemptsByExam = async (req: Request, res: Response) => {
  try {
    const attempts = await Attempt.find({
      examId: req.params.examId,
      isSubmitted: true,
    })
      .populate("studentId", "name grade")
      .sort({ createdAt: -1 });

    res.json(attempts);
  } catch {
    res.status(500).json({ message: "Failed to fetch attempts" });
  }
};


/**
 * 6) Admin all attempts
 */
export const getAllAttempts = async (_req: Request, res: Response) => {
  try {
    const attempts = await Attempt.find()
      .populate("studentId", "name grade")
      .populate("examId", "title");

    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attempts", err });
  }
};
