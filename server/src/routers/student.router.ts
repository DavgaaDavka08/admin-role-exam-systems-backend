import express from "express";
import { verifyToken } from "../middleware/verify.token";
import { authorizeRoles } from "../middleware/role.middleware";
import {
  bulkDeleteStudents,
  createStudent,
  deleteStudent,
  listStudents,
} from "../controllers/student.controller";

const router = express.Router();

router.use(verifyToken, authorizeRoles("admin"));

router.get("/", listStudents);
router.post("/", createStudent);
router.delete("/bulk", bulkDeleteStudents);
router.delete("/:id", deleteStudent);

export default router;

