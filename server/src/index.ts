import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./config/connect.db";

import userRoute from "./routers/user.router";
import roleRouter from "./routers/role.router";
dotenv.config();
connectDb();
const app = express();

app.use(express.json());

app.use("/api/auth", userRoute);
app.use("/api/users", roleRouter);

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("started back-end hello world");
});

app.listen(port as number, "localhost", () => {
  console.log(`Server is running at http://localhost:${port}`);
});
