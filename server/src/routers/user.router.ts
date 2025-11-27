import express from "express";
import { registerController } from "../controllers/register.controller";
import { login } from "../controllers/login.controller";
const route = express.Router();

route.post("/register", registerController);
route.post("/login", login);
export default route;
