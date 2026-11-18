import express from "express";
import { getPublicTuitions } from "../controllers/tuitionController.js";

const router = express.Router();

// Get all approved and active public tuitions
router.get("/", getPublicTuitions);

export default router;
