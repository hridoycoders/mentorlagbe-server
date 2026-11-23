import express from "express";

import verifyStudent from "../middleware/verifyStudent.js";
import verifyTutor from "../middleware/verifyTutor.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

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
  verifyStudent,
  getStudentStats,
);

// Tutor Dashboard Statistics
router.get("/stats/tutor", verifyTutor, getTutorStats);

// Admin Dashboard Statistics
router.get("/stats/admin", verifyAdmin, getAdminStats);

// Admin: Payment Transaction History
router.get(
  "/transactions",
  verifyAdmin,
  getAllTransactions,
);

export default router;
