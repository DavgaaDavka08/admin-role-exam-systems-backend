import { Request, Response } from "express";
import { Exam } from "../models/exam.models";
import { Attempt } from "../models/attempt.model";
export const createExam=async(req:Request, res:Response)=>{
    try {
        const exam=await Exam.create(req.body)
        res.status(201).json({massage:`success in create-exam`,exam})
    } catch (error) {
        console.log('error :>> ', error);
        res.status(404).json({massge:"error create exam ",error})
    }
}
export const getExams = async (req: Request, res: Response) => {
  try {
    const studentId = req.query.studentId;

    const exams = await Exam.find().lean();

    let attempts = [];
    if (studentId) {
      attempts = await Attempt.find({
        studentId,
        isSubmitted: true,
      });
    }

    const submittedExamIds = new Set(attempts.map(a => a.examId.toString()));

    const result = exams.map(exam => ({
      ...exam,
      hasAttempt: submittedExamIds.has(exam._id.toString()),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch exams" });
  }
};
  export const getExamById = async (req: Request, res: Response) => {
    try {
      const exam = await Exam.findById(req.params.id);
      res.json(exam);
    } catch (err) {
      res.status(500).json({ message: "Exam not found" });
    }
  };
  export const updateExam = async (req: Request, res: Response) => {
    try {
      const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(exam);
    } catch (err) {
      res.status(500).json({ message: "Failed to update exam" });
    }
  };
  export const deleteExam = async (req: Request, res: Response) => {
    try {
      await Exam.findByIdAndDelete(req.params.id);
      res.json({ message: "Exam deleted" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete exam" });
    }
  };