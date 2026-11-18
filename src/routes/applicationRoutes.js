import express from "express";

import { createApplication } from "../controllers/applicationController.js";
import verifyToken from "../middleware/verifyToken.js";
import authorizeRole from "../middleware/authorizeRole.js";

const router = express.Router();

router.post("/", verifyToken, authorizeRole("student"), createApplication);

export default router;
