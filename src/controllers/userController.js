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
          phone: 1,
          bio: 1,
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

// Update logged-in user's own profile
const updateMyProfile = async (req, res) => {
  try {
    const { name, image, phone, bio } = req.body;

    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name is required.",
        });
      }

      if (name.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: "Name cannot exceed 100 characters.",
        });
      }

      updates.name = name.trim();
    }

    if (image !== undefined) {
      if (typeof image !== "string" || image.length > 2048) {
        return res.status(400).json({
          success: false,
          message: "Invalid profile image URL.",
        });
      }

      const trimmedImage = image.trim();

      if (trimmedImage) {
        try {
          const imageUrl = new URL(trimmedImage);

          if (!["http:", "https:"].includes(imageUrl.protocol)) {
            throw new Error("Invalid protocol");
          }
        } catch {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid image URL.",
          });
        }
      }

      updates.image = trimmedImage;
    }

    if (phone !== undefined) {
      if (typeof phone !== "string" || phone.trim().length > 30) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be a valid string under 30 characters.",
        });
      }

      updates.phone = phone.trim();
    }

    if (bio !== undefined) {
      if (typeof bio !== "string" || bio.trim().length > 500) {
        return res.status(400).json({
          success: false,
          message: "Bio cannot exceed 500 characters.",
        });
      }

      updates.bio = bio.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update.",
      });
    }

    updates.updatedAt = new Date();

    const db = getDB();

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(req.user.id) }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    const updatedUser = await db.collection("users").findOne(
      { _id: new ObjectId(req.user.id) },
      {
        projection: {
          _id: 1,
          name: 1,
          email: 1,
          image: 1,
          phone: 1,
          bio: 1,
          role: 1,
          plan: 1,
          createdAt: 1,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        ...updatedUser,
        _id: updatedUser._id.toString(),
      },
    });
  } catch (error) {
    console.error("Update My Profile Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
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

// Admin: Update user role
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

// Admin: Update user account status
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

export {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
};
