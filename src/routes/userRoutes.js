import express from "express";

import verifyToken from "../middleware/verifyToken.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

import {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
} from "../controllers/userController.js";

const router = express.Router();

// Logged-in user: Get own profile
router.get("/me", verifyToken, getMyProfile);

// Logged-in user: Update own profile
router.patch("/me", verifyToken, updateMyProfile);

// Admin: Get all users
router.get("/admin", verifyAdmin, getAllUsers);

// Admin: Update user role
router.patch(
  "/admin/:id/role",
  verifyAdmin,
  updateUserRole,
);

// Admin: Update user account status
router.patch(
  "/admin/:id/status",
  verifyAdmin,
  updateUserStatus,
);

export default router;
