import express from "express";

import {
  createApplication,
  getStudentApplications,
  getTutorApplications,
  getTutorApplicationById,
  updateApplicationStatus,
} from "../controllers/applicationController.js";

import verifyToken from "../middleware/verifyToken.js";
import authorizeRole from "../middleware/authorizeRole.js";

const router = express.Router();

// Student: Get own applications
router.get(
  "/student",
  verifyToken,
  authorizeRole("student"),
  getStudentApplications,
);

// Tutor: Get all applications for own tuitions
router.get("/tutor", verifyToken, authorizeRole("tutor"), getTutorApplications);

// Tutor: Get a specific application by ID
router.get(
  "/tutor/:id",
  verifyToken,
  authorizeRole("tutor"),
  getTutorApplicationById,
);

// Tutor: Accept or reject an application
router.patch(
  "/tutor/:id/status",
  verifyToken,
  authorizeRole("tutor"),
  updateApplicationStatus,
);

// Student: Apply for a tuition
router.post("/", verifyToken, authorizeRole("student"), createApplication);

export default router;
