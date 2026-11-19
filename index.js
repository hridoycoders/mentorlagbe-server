import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import verifyToken from "./src/middleware/verifyToken.js";
import userRoutes from "./src/routes/userRoutes.js";
import tuitionRoutes from "./src/routes/tuitionRoutes.js";
import applicationRoutes from "./src/routes/applicationRoutes.js";
import createIndexes from "./src/config/indexes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// Stripe Webhook: Preserve raw request body
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
  res.send("MentorLagbe Server is Running!");
});

// Protected Test Route
app.get("/api/auth-check", verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication successful!",
    user: req.user,
  });
});

const startServer = async () => {
  try {
    await connectDB();
    await createIndexes();

    app.use("/api/users", userRoutes);
    app.use("/api/tuitions", tuitionRoutes);
    app.use("/api/applications", applicationRoutes);
    app.use("/api/payments", paymentRoutes);
    app.use("/api/dashboard", dashboardRoutes);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
