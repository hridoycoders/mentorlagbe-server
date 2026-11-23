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

import verifyAdmin from "../middleware/verifyAdmin.js";
import verifyTutor from "../middleware/verifyTutor.js";

const router = express.Router();

// Public: Search and filter tuition listings
router.get("/search", searchPublicTuitions);

// Admin: Get all tuition listings
router.get("/admin/all", verifyAdmin, getAllTuitions);

// Admin: Approve or reject a tuition listing
router.patch(
  "/admin/:id/status",
  verifyAdmin,
  updateTuitionStatus,
);

// Tutor: Get own tuition listings
// Keep this route before /:id
router.get("/my", verifyTutor, getTutorTuitions);

// Public: Get approved and active tuition listings
router.get("/", getPublicTuitions);

// Tutor: Create a tuition listing
router.post("/", verifyTutor, createTuition);

// Tutor: Update own tuition listing
router.patch("/:id", verifyTutor, updateTutorTuition);

// Tutor: Delete own tuition listing
router.delete("/:id", verifyTutor, deleteTutorTuition);

// Public: Get a single tuition listing
router.get("/:id", getPublicTuitionById);

export default router;
