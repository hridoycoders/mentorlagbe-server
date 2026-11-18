import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

const getMyProfile = async (req, res) => {
  try {
    const db = getDB();

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(req.user.id) },
      {
        projection: {
          _id: 1,
          name: 1,
          email: 1,
          image: 1,
          role: 1,
          plan: 1,
          createdAt: 1,
        },
      },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully.",
      data: {
        ...user,
        _id: user._id.toString(),
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve profile.",
    });
  }
};

export { getMyProfile };
