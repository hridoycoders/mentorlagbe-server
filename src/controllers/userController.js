import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

// Get logged-in user's profile
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

// Admin: Get all users
const getAllUsers = async (req, res) => {
  try {
    const db = getDB();

    const users = await db
      .collection("users")
      .find(
        {},
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
      )
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      message: "All users retrieved successfully.",
      total: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users.",
    });
  }
};


const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    if (!["student", "tutor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be student or tutor.",
      });
    }

    if (id === req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    const db = getDB();

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          role,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const updatedUser = await db.collection("users").findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          plan: 1,
          createdAt: 1,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update User Role Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update user role.",
    });
  }
};


const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean value.",
      });
    }

    if (id === req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own account status.",
      });
    }

    const db = getDB();

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isActive,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `User account ${isActive ? "activated" : "deactivated"} successfully.`,
      data: {
        userId: id,
        isActive,
      },
    });
  } catch (error) {
    console.error("Update User Status Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update user status.",
    });
  }
};



export { getMyProfile, getAllUsers, updateUserRole, updateUserStatus };
