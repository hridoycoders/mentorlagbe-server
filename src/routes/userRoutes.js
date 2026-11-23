import express from "express";

import verifyToken from "../middleware/verifyToken.js";
import authorizeRole from "../middleware/authorizeRole.js";

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
router.get("/admin", verifyToken, authorizeRole("admin"), getAllUsers);

// Admin: Update user role
router.patch(
  "/admin/:id/role",
  verifyToken,
  authorizeRole("admin"),
  updateUserRole,
);

// Admin: Update user account status
router.patch(
  "/admin/:id/status",
  verifyToken,
  authorizeRole("admin"),
  updateUserStatus,
);

export default router;
