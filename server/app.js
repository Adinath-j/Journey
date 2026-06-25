import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./src/routes/authRoutes.js";

const app = express();

// Security and Middleware
app.use(helmet());
app.use(cors({
  origin: "http://localhost:1420", // Tauri / Vite default
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);

import roadmapRoutes from "./src/routes/roadmapRoutes.js";
app.use("/api/roadmap", roadmapRoutes);

import logRoutes from "./src/routes/logRoutes.js";
app.use("/api/logs", logRoutes);

import dashboardRoutes from "./src/routes/dashboardRoutes.js";
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error", error: process.env.NODE_ENV === "development" ? err.message : undefined });
});

export default app;
