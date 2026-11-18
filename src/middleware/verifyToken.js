import { createRemoteJWKSet, jwtVerify } from "jose";
import { getDB } from "../config/db.js";

const authURL = process.env.BETTER_AUTH_URL;

const JWKS = createRemoteJWKSet(new URL(`${authURL}/api/auth/jwks`));

const verifyToken = async (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Token is required.",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify JWT signature
    const { payload } = await jwtVerify(token, JWKS);

    // Get user email from verified token
    const email = payload.email;

    if (!email) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    // Find trusted user from MongoDB
    const db = getDB();

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // Attach trusted user information
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
    };

    next();
  } catch (error) {
    console.error("Token Verification Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export default verifyToken;
