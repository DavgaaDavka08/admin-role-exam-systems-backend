import express from "express";
import { registerController } from "../controllers/register.controller";
const route = express.Router();

route.post("/register", registerController);

export default route;
