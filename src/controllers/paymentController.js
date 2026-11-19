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

      success_url: `${process.env.CLIENT_URL}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard/payment-cancel`,
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

export { createCheckoutSession };
