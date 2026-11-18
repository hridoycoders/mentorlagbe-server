import express from "express";

import {
  getPublicTuitions,
  searchPublicTuitions,
} from "../controllers/tuitionController.js";

const router = express.Router();

// Search and filter public tuitions
router.get("/search", searchPublicTuitions);

// Get all approved and active public tuitions
router.get("/", getPublicTuitions);

export default router;
