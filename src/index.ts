// import dotenv from "dotenv";
// dotenv.config();
console.log("MONGODB_URI:", process.env["MONGODB_URI"]);
console.log("JWT_SECRET:", process.env["JWT_SECRET"]);
import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import { env } from "./config/env.js";

import userRoute from "./routes/userRoute.js";
import orderRoute from "./routes/orderRoute.js";
import productRoute from "./routes/productRoute.js";
import { setServers } from "node:dns/promises";
import cookieParser from "cookie-parser";

setServers(['1.1.1.1', '8.8.8.8']);

// App init
const app = express();
const port = env.PORT || 8000;

// Middleware
app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

// DB connection
try {
  await connectDB();
  console.log("Database connected");
} catch (error) {
  console.error("Database connection failed:", error);
  process.exit(1);
}

// Routes (FIXED: leading slash)
app.use("/api/v1", userRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", productRoute);

// Health check (FIXED handler)
app.get("/", (_req: Request, res: Response) => {
  res.send("E-commerce API is running 🚀");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});