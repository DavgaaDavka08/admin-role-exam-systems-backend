import { Router } from "express";
import multer from "multer";
import { verifyToken } from "../middleware/verify.token";
import { authorizeRoles } from "../middleware/role.middleware";
import {
  uploadFile,
  submitPractical,
  getMySubmission,
  listSubmissions,
  getSubmission,
  reviewSubmission,
} from "../controllers/practical.controller";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// File upload - any authenticated user
router.post("/upload", verifyToken, upload.single("file"), uploadFile);

// Student submission
router.post("/submit", verifyToken, submitPractical);
router.get(
  "/mine/:studentId/:examId",
  verifyToken,
  getMySubmission
);

// Admin review
router.get(
  "/submissions",
  verifyToken,
  authorizeRoles("admin"),
  listSubmissions
);
router.get(
  "/submissions/:id",
  verifyToken,
  authorizeRoles("admin"),
  getSubmission
);
router.patch(
  "/submissions/:id/review",
  verifyToken,
  authorizeRoles("admin"),
  reviewSubmission
);

export default router;
