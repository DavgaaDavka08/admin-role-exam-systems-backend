import express from "express";
import { verifyToken } from "../middleware/verify.token";
import { authorizeRoles } from "../middleware/role.middleware";
import { changeAdminPassword } from "../controllers/admin.controller";

const router = express.Router();

router.use(verifyToken, authorizeRoles("admin"));

router.patch("/password", changeAdminPassword);

export default router;

