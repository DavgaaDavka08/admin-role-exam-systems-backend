// controllers/attempt.controller.ts
import { Request, Response } from "express";
import { Attempt } from "../models/attempt.model";
import { Exam } from "../models/exam.models";

export const startAttempt = async (req: Request, res: Response) => {
  try {
    const { studentId, examId } = req.body;

    // тухайн шалгалт дээр өмнө нь дуусаагүй attempt байгаа эсэх
    let attempt = await Attempt.findOne({
      studentId,
      examId,
      isSubmitted: false,
    });

    if (!attempt) {
      const exam = await Exam.findById(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }

      attempt = await Attempt.create({
        studentId,
        examId,
        answers: [],
        totalQuestions: exam.questions.length,
      });
    }

    res.json(attempt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to start attempt" });
  }
};

export const saveAnswer = async (req: Request, res: Response) => {
  try {
    const { attemptId, questionId, selectedOption } = req.body;

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    const existing = attempt.answers.find(
      (ans) => ans.questionId === questionId
    );

    if (existing) {
      existing.selectedOption = selectedOption;
    } else {
      attempt.answers.push({ questionId, selectedOption });
    }

    await attempt.save();
    res.json(attempt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save answer" });
  }
};

export const submitAttempt = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.body;

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    const exam = await Exam.findById(attempt.examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

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

    res.json({ score, total: exam.questions.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to submit attempt" });
  }
};

export const getAttemptById = async (req: Request, res: Response) => {
  try {
    const attempt = await Attempt.findById(req.params.id).populate(
      "studentId",
      "name grade"
    );

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAttemptsByExam = async (req: Request, res: Response) => {
  const { examId } = req.params;

  const attempts = await Attempt.find({
    examId,
    isSubmitted: true,
  })
    .populate("studentId", "name grade")
    .sort({ createdAt: -1 });

  res.json(attempts);
};
export const getAllAttempts = async (req: Request, res: Response) => {
  try {
    const attempts = await Attempt.find()
      .populate("studentId", "name grade")
      .populate("examId", "title");

    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attempts", err });
  }
};
