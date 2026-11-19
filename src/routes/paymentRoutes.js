import express from "express";

import verifyToken from "../middleware/verifyToken.js";
import authorizeRole from "../middleware/authorizeRole.js";

import {
  createCheckoutSession,
  handleStripeWebhook
} from "../controllers/paymentController.js";

const router = express.Router();

// Stripe Webhook
router.post("/webhook", handleStripeWebhook);

// Create Stripe Checkout Session
router.post(
  "/create-checkout-session",
  verifyToken,
  authorizeRole("tutor", "student"),
  createCheckoutSession,
);

export default router;
