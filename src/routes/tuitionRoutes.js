import express from "express";

import {
  getPublicTuitions,
  searchPublicTuitions,
  getPublicTuitionById,
} from "../controllers/tuitionController.js";

const router = express.Router();

// Search and filter public tuitions
router.get("/search", searchPublicTuitions);

// Get all approved and active public tuitions
router.get("/", getPublicTuitions);

// Get single tuition details
router.get("/:id", getPublicTuitionById);

export default router;
