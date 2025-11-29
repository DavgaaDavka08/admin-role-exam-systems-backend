import express from "express";
import { verifyToken } from "../middleware/verify.token";
import { authorizeRoles } from "../middleware/role.middleware";

const roleRouter = express.Router();

roleRouter.get(
  "/admin",
  verifyToken,
  authorizeRoles("admin", "manager"),
  (req, res) => {
    res.json({ message: "Welcome admin" });
  }
);

roleRouter.get(
  "/manager",
  verifyToken,
  authorizeRoles("admin", "manager"),
  (req, res) => {
    res.json({ message: "Welcome manager" });
  }
);

roleRouter.get(
  "/user",
  verifyToken,
  authorizeRoles("admin", "manager", "user"),
  (req, res) => {
    res.json({ message: "Welcome user" });
  }
);

export default roleRouter;
