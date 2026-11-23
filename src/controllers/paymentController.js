import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import stripe from "../config/stripe.js";

// Create Stripe Checkout Session
const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const db = getDB();

    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!["tutor", "student"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only tutors and students can purchase Pro plans.",
      });
    }

    if (user.plan === "pro") {
      return res.status(400).json({
        success: false,
        message: "You already have a Pro plan.",
      });
    }

    const planName =
      user.role === "tutor" ? "Pro Tutor Plan" : "Pro Student Plan";

    const amount = user.role === "tutor" ? 1500 : 1000;

    const session = await stripe.checkout.sessions.create({

      mode: "payment",

      customer_email: user.email,

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: planName,
              description: `Upgrade to ${planName}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],

      metadata: {
        userId: user._id.toString(),
        userEmail: user.email,
        userName: user.name || "",
        userRole: user.role,
        planName,
        amount: String(amount / 100),
      },

      success_url: `${process.env.CLIENT_URL}/payment/success`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    });

    return res.status(200).json({
      success: true,
      message: "Checkout session created successfully.",
      data: {
        sessionId: session.id,
        checkoutUrl: session.url,
      },
    });
  } catch (error) {
    console.error("Create Checkout Session Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create checkout session.",
    });
  }
};


const handleStripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;

  // Verify Stripe webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("Webhook Signature Error:", error.message);

    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const { userId, userEmail, userName, userRole, planName } =
        session.metadata || {};

      // Verify payment details
      const expectedAmount = userRole === "tutor" ? 1500 : 1000;

      if (
        session.payment_status !== "paid" ||
        !userId ||
        !ObjectId.isValid(userId) ||
        !["tutor", "student"].includes(userRole) ||
        session.currency !== "usd" ||
        session.amount_total !== expectedAmount ||
        !session.payment_intent
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment information.",
        });
      }

      const db = getDB();

      // Prevent duplicate payment processing
      const existingPayment = await db.collection("payments").findOne({
        sessionId: session.id,
      });

      if (existingPayment) {
        // Ensure user plan is upgraded even during webhook retry
        const userResult = await db.collection("users").updateOne(
          {
            _id: new ObjectId(userId),
            role: userRole,
          },
          {
            $set: {
              plan: "pro",
              updatedAt: new Date(),
            },
          },
        );

        if (userResult.matchedCount === 0) {
          throw new Error("User not found or role mismatch.");
        }

        return res.status(200).json({
          success: true,
          received: true,
          message: "Payment already processed.",
        });
      }

      // Verify user and upgrade plan
      const userResult = await db.collection("users").updateOne(
        {
          _id: new ObjectId(userId),
          role: userRole,
          plan: { $in: ["free", "pro"] },
        },
        {
          $set: {
            plan: "pro",
            updatedAt: new Date(),
          },
        },
      );

      if (userResult.matchedCount === 0) {
        throw new Error("User not found or role mismatch.");
      }

      // Save payment record
      await db.collection("payments").insertOne({
        userId: new ObjectId(userId),
        userEmail,
        userName,
        userRole,
        planName,
        amount: session.amount_total / 100,
        currency: session.currency,
        sessionId: session.id,
        paymentIntentId: session.payment_intent,
        paymentStatus: "paid",
        createdAt: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      received: true,
    });
  } catch (error) {
    console.error("Stripe Webhook Processing Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed.",
    });
  }
};




export { createCheckoutSession, handleStripeWebhook };
