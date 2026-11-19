import express from "express";

import verifyToken from "../middleware/verifyToken.js";
import authorizeRole from "../middleware/authorizeRole.js";

import {
  getStudentStats,
  getTutorStats,
  getAdminStats,
  getAllTransactions,
} from "../controllers/dashboardController.js";

const router = express.Router();

// Student Dashboard Statistics
router.get(
  "/stats/student",
  verifyToken,
  authorizeRole("student"),
  getStudentStats,
);

// Tutor Dashboard Statistics
router.get("/stats/tutor", verifyToken, authorizeRole("tutor"), getTutorStats);

// Admin Dashboard Statistics
router.get("/stats/admin", verifyToken, authorizeRole("admin"), getAdminStats);

// Admin: Payment Transaction History
router.get(
  "/transactions",
  verifyToken,
  authorizeRole("admin"),
  getAllTransactions,
);

export default router;
