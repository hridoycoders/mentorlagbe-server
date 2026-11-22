import express from "express";

import {
  createTuition,
  getTutorTuitions,
  getPublicTuitions,
  searchPublicTuitions,
  getPublicTuitionById,
  updateTutorTuition,
  deleteTutorTuition,
  getAllTuitions,
  updateTuitionStatus,
} from "../controllers/tuitionController.js";

import verifyToken from "../middleware/verifyToken.js";
import authorizeRole from "../middleware/authorizeRole.js";

const router = express.Router();

// Search and filter public tuitions
router.get("/search", searchPublicTuitions);

// Admin: Get all tuitions
router.get("/admin/all", verifyToken, authorizeRole("admin"), getAllTuitions);

// Admin: Approve or reject a tuition
router.patch(
  "/admin/:id/status",
  verifyToken,
  authorizeRole("admin"),
  updateTuitionStatus,
);

// Tutor: Get all of their own tuitions
// Keep this route before /:id
router.get("/my", verifyToken, authorizeRole("tutor"), getTutorTuitions);

// Get all approved and active public tuitions
router.get("/", getPublicTuitions);

// Create a new tuition (Tutor only)
router.post("/", verifyToken, authorizeRole("tutor"), createTuition);

// Update tutor's own tuition
router.patch("/:id", verifyToken, authorizeRole("tutor"), updateTutorTuition);

// Delete tutor's own tuition
router.delete("/:id", verifyToken, authorizeRole("tutor"), deleteTutorTuition);

// Get single tuition details
router.get("/:id", getPublicTuitionById);

export default router;
