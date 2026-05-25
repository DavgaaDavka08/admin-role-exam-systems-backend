import { Request, Response } from "express";
import { Attempt } from "../models/attempt.model";
import { Exam } from "../models/exam.models";

// Selected option is stored as a string. For multi-select questions the
// frontend sends a CSV like "A,C". We split, normalize, and compare to the
// question's correct answer set.
function isCorrectAnswer(question: any, selected: string): boolean {
  const correctList: string[] =
    Array.isArray(question.correctAnswers) && question.correctAnswers.length
      ? question.correctAnswers
      : question.correctAnswer
      ? [question.correctAnswer]
      : [];
  if (correctList.length === 0) return false;

  if (question.type === "multiple") {
    const selectedSet = new Set(
      String(selected)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
    if (selectedSet.size !== correctList.length) return false;
    return correctList.every((c: string) => selectedSet.has(c));
  }

  return selected === correctList[0];
}

export const startAttempt = async (req: Request, res: Response) => {
  try {
    const { studentId, examId } = req.body;

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

    let attempt = await Attempt.findOne({
      studentId,
      examId,
      isSubmitted: false,
    });

    if (attempt) {
      return res.json(attempt);
    }

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

    const total = exam.questions.length;
    let correctCount = 0;

    exam.questions.forEach((q: any) => {
      const ans = attempt.answers.find((a) => a.questionId === q.id);
      if (!ans?.selectedOption) return;
      if (isCorrectAnswer(q, ans.selectedOption)) correctCount++;
    });

    const score = correctCount;
    const wrongCount = total - correctCount;
    const percentage = total === 0 ? 0 : Math.round((correctCount / total) * 100);
    const theoryMaxScore = exam.theoryMaxScore || 100;
    const scaledScore =
      total === 0 ? 0 : Math.round((correctCount / total) * theoryMaxScore);

    attempt.score = score;
    attempt.totalQuestions = total;
    attempt.isSubmitted = true;
    attempt.finishedAt = new Date();

    await attempt.save();

    return res.json({
      message: "Шалгалт амжилттай илгээгдлээ",
      score,
      total,
      correctCount,
      wrongCount,
      percentage,
      scaledScore,
      theoryMaxScore,
    });
  } catch (error) {
    console.error("Submit error:", error);
    res.status(500).json({ message: "Failed to submit attempt" });
  }
};

export const getAttemptById = async (req: Request, res: Response) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate("studentId", "name grade")
      .populate("examId");

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    const exam = await Exam.findById(attempt.examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const total = exam.questions.length;

    const answersWithResult = exam.questions.map((q: any, idx: number) => {
      const ans = attempt.answers.find((a) => a.questionId === q.id);
      const selectedOption = ans?.selectedOption;
      const correctOption = q.correctAnswer;
      const correctOptions =
        q.correctAnswers && q.correctAnswers.length
          ? q.correctAnswers
          : q.correctAnswer
          ? [q.correctAnswer]
          : [];
      const isCorrect =
        selectedOption !== undefined && isCorrectAnswer(q, selectedOption);

      return {
        questionId: q.id,
        questionIndex: idx + 1,
        questionType: q.type || "single",
        selectedOption,
        correctOption,
        correctOptions,
        isCorrect,
      };
    });

    const correctCount = answersWithResult.filter((a) => a.isCorrect).length;
    const wrongCount = total - correctCount;
    const score = correctCount; // score = зөв хариулсан асуултын тоо
    const percentage = total === 0 ? 0 : Math.round((correctCount / total) * 100);

    res.json({
      ...attempt.toObject(),
      answers: answersWithResult,
      total,
      score,
      correctCount,
      wrongCount,
      percentage,
    });
  } catch (error) {
    console.error("Get attempt error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

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
