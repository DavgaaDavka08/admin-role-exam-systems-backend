import { Request, Response } from "express";
import { Exam } from "../models/exam.models";
import { PracticalSubmission } from "../models/practical.submission.model";
import { storeArchive, storeImage } from "../lib/upload";

const SCORE_KEYS = [
  "uiSimilarity",
  "responsive",
  "codeStructure",
  "functionality",
] as const;

function clampScore(n: any, max: number) {
  const v = Number(n);
  if (!Number.isFinite(v) || v < 0) return 0;
  if (v > max) return max;
  return v;
}

// --- public-ish (student) endpoints ---

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const kind = (req.query.kind as string) || "image";
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const stored =
      kind === "archive" ? await storeArchive(file) : await storeImage(file);
    res.json(stored);
  } catch (e: any) {
    console.error("upload error", e);
    res.status(500).json({ message: "Upload failed", error: e?.message });
  }
};

export const submitPractical = async (req: Request, res: Response) => {
  try {
    const { studentId, examId, tasks, finalize } = req.body as {
      studentId: string;
      examId: string;
      tasks: Array<{
        taskId: string;
        archive?: any;
        screenshots?: any[];
        notes?: string;
      }>;
      finalize?: boolean;
    };

    if (!studentId || !examId) {
      return res.status(400).json({ message: "studentId and examId required" });
    }

    const exam = await Exam.findById(examId).lean();
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    if (!exam.hasPractical || !exam.practicalTasks?.length) {
      return res.status(400).json({ message: "Exam has no practical part" });
    }

    const tasksMeta = (exam.practicalTasks || []) as any[];
    const maxScore = tasksMeta.reduce(
      (sum: number, t: any) => sum + (t.maxScore || 0),
      0
    );

    let submission = await PracticalSubmission.findOne({ studentId, examId });

    if (submission && submission.isSubmitted) {
      return res
        .status(400)
        .json({ message: "Practical already submitted", submission });
    }

    if (!submission) {
      submission = await PracticalSubmission.create({
        studentId,
        examId,
        tasks: (tasks || []) as any,
        maxScore,
        isSubmitted: !!finalize,
        submittedAt: finalize ? new Date() : undefined,
      });
    } else {
      submission.set("tasks", tasks || submission.tasks);
      submission.maxScore = maxScore;
      if (finalize) {
        submission.isSubmitted = true;
        submission.submittedAt = new Date();
        submission.status = "pending";
      }
      await submission.save();
    }

    res.json(submission);
  } catch (e: any) {
    console.error("submit practical error", e);
    res.status(500).json({ message: "Failed to submit practical" });
  }
};

export const getMySubmission = async (req: Request, res: Response) => {
  try {
    const { studentId, examId } = req.params;
    const sub = await PracticalSubmission.findOne({ studentId, examId });
    res.json(sub);
  } catch {
    res.status(500).json({ message: "Failed to load submission" });
  }
};

// --- admin endpoints ---

export const listSubmissions = async (req: Request, res: Response) => {
  try {
    const { status, examId } = req.query as {
      status?: string;
      examId?: string;
    };
    const filter: any = { isSubmitted: true };
    if (status) filter.status = status;
    if (examId) filter.examId = examId;

    const list = await PracticalSubmission.find(filter)
      .populate("studentId", "name grade barcode")
      .populate("examId", "title practicalMaxScore")
      .sort({ submittedAt: -1, createdAt: -1 });

    res.json(list);
  } catch {
    res.status(500).json({ message: "Failed to load submissions" });
  }
};

export const getSubmission = async (req: Request, res: Response) => {
  try {
    const sub = await PracticalSubmission.findById(req.params.id)
      .populate("studentId", "name grade barcode")
      .populate("examId");
    if (!sub) return res.status(404).json({ message: "Not found" });
    res.json(sub);
  } catch {
    res.status(500).json({ message: "Failed to load submission" });
  }
};

export const reviewSubmission = async (req: Request, res: Response) => {
  try {
    const { reviews, status, overallFeedback } = req.body as {
      reviews: Array<{
        taskId: string;
        scores: Partial<Record<(typeof SCORE_KEYS)[number], number>>;
        feedback?: string;
      }>;
      status?: "pending" | "reviewed" | "passed" | "failed";
      overallFeedback?: string;
    };

    const sub = await PracticalSubmission.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: "Not found" });

    const exam = await Exam.findById(sub.examId).lean();
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const examTasks = (exam.practicalTasks || []) as any[];
    const tasksById = new Map<string, any>(
      examTasks.map((t: any) => [t.id as string, t])
    );

    let total = 0;
    const builtReviews = (reviews || []).map((r) => {
      const task: any = tasksById.get(r.taskId);
      const maxPerCriterion = task ? (task.maxScore || 100) / 4 : 25;

      const scores: any = {};
      for (const k of SCORE_KEYS) {
        scores[k] = clampScore(r.scores?.[k], maxPerCriterion);
      }
      const taskTotal =
        scores.uiSimilarity +
        scores.responsive +
        scores.codeStructure +
        scores.functionality;
      total += taskTotal;
      return {
        taskId: r.taskId,
        scores,
        feedback: r.feedback,
        totalScore: taskTotal,
      };
    });

    sub.set("reviews", builtReviews);
    sub.totalScore = total;
    sub.maxScore = examTasks.reduce(
      (s: number, t: any) => s + (t.maxScore || 0),
      0
    );
    sub.overallFeedback = overallFeedback;
    sub.status = status || "reviewed";
    sub.reviewedAt = new Date();
    sub.reviewedBy = req.user?.id as any;

    await sub.save();
    res.json(sub);
  } catch (e: any) {
    console.error("review submission error", e);
    res.status(500).json({ message: "Failed to review submission" });
  }
};
