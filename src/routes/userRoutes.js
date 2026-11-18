import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { getMyProfile } from "../controllers/userController.js";

const router = express.Router();

// Get logged-in user's profile
router.get("/me", verifyToken, getMyProfile);

export default router;
