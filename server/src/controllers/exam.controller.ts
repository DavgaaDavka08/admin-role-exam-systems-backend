import { Request, Response } from "express";
import { Exam } from "../models/exam.models";
export const createExam=async(req:Request, res:Response)=>{
    try {
        const exam=await Exam.create(req.body)
        res.status(201).json({massage:`success in create-exam`,exam})
    } catch (error) {
        console.log('error :>> ', error);
        res.status(404).json({massge:"error create exam ",error})
    }
}
export const getExams = async (_req: Request, res: Response) => {
    try {
      const exams = await Exam.find().sort({ createdAt: -1 });
      res.json(exams);
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