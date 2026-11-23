import express from "express";

import {
  createApplication,
  getStudentApplications,
  getTutorApplications,
  getTutorApplicationById,
  updateApplicationStatus,
  deleteApplication,
} from "../controllers/applicationController.js";

import verifyStudent from "../middleware/verifyStudent.js";
import verifyTutor from "../middleware/verifyTutor.js";

const router = express.Router();

// Student: Get own applications
router.get(
  "/student",
  verifyStudent,
  getStudentApplications,
);

// Tutor: Get all applications for own tuitions
router.get("/tutor", verifyTutor, getTutorApplications);

// Tutor: Get a specific application by ID
router.get(
  "/tutor/:id",
  verifyTutor,
  getTutorApplicationById,
);

// Tutor: Accept or reject an application
router.patch(
  "/tutor/:id/status",
  verifyTutor,
  updateApplicationStatus,
);

// Student: Apply for a tuition
router.post("/", verifyStudent, createApplication);

// Student: Cancel a pending application
router.delete("/:id", verifyStudent, deleteApplication);

export default router;
