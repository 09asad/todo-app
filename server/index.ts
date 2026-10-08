import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth";
import todoRoutes from "./routes/todo";

const app = express();

const port = 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/todo", todoRoutes);

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error("MONGO_URI is not defined");
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("Database Connection Established");

    app.listen(port, () => {
      console.log(`Todo app listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log("Database connection failed", err);
  });