import express from "express";

import {
  createTuition,
  getPublicTuitions,
  searchPublicTuitions,
  getPublicTuitionById,
} from "../controllers/tuitionController.js";

import verifyToken from "../middleware/verifyToken.js";
import authorizeRole from "../middleware/authorizeRole.js";

const router = express.Router();

// Search and filter public tuitions
router.get("/search", searchPublicTuitions);

// Get all approved and active public tuitions
router.get("/", getPublicTuitions);

// Create a new tuition (Tutor only)
router.post("/", verifyToken, authorizeRole("tutor"), createTuition);

// Get single tuition details
router.get("/:id", getPublicTuitionById);

export default router;
