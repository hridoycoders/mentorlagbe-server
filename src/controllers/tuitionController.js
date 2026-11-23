import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

// Escape special regex characters
const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Create a new tuition (Tutor only)
const createTuition = async (req, res) => {
  try {
    const {
      title,
      subject,
      classLevel,
      mode,
      location,
      monthlyFee,
      daysPerWeek,
      description,
      bannerImage,
    } = req.body;

    if (
      !title?.trim() ||
      !subject?.trim() ||
      !classLevel?.trim() ||
      !mode?.trim() ||
      !location?.trim() ||
      !description?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required tuition information.",
      });
    }

    const minFee = Number(monthlyFee?.min);
    const maxFee = Number(monthlyFee?.max);

    if (
      !Number.isFinite(minFee) ||
      !Number.isFinite(maxFee) ||
      minFee <= 0 ||
      maxFee < minFee
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid monthly fee range.",
      });
    }

    const days = Number(daysPerWeek);

    if (!Number.isInteger(days) || days < 1 || days > 7) {
      return res.status(400).json({
        success: false,
        message: "Days per week must be between 1 and 7.",
      });
    }

    const db = getDB();

    const tutor = await db.collection("users").findOne({
      _id: new ObjectId(req.user.id),
    });

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor account not found.",
      });
    }

    const tutorPlan = tutor.plan || "free";

    if (tutorPlan !== "pro") {
      const activeTuitionCount = await db
        .collection("tuitions")
        .countDocuments({
          tutorId: new ObjectId(req.user.id),
          isActive: true,
        });

      if (activeTuitionCount >= 2) {
        return res.status(403).json({
          success: false,
          message:
            "Free plan allows only 2 active tuition posts. Upgrade to Pro for unlimited posts.",
        });
      }
    }

    const newTuition = {
      title: title.trim(),
      subject: subject.trim(),
      classLevel: classLevel.trim(),
      mode: mode.trim(),
      location: location.trim(),

      monthlyFee: {
        min: minFee,
        max: maxFee,
        currency: "BDT",
        period: "monthly",
      },

      daysPerWeek: days,
      description: description.trim(),
      bannerImage: bannerImage?.trim() || "",

      tutorId: new ObjectId(req.user.id),
      tutorName: req.user.name,
      tutorEmail: req.user.email,

      status: "pending",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("tuitions").insertOne(newTuition);

    return res.status(201).json({
      success: true,
      message: "Tuition created successfully. Waiting for admin approval.",
      data: {
        ...newTuition,
        _id: result.insertedId.toString(),
        tutorId: newTuition.tutorId.toString(),
      },
    });
  } catch (error) {
    console.error("Create Tuition Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create tuition.",
    });
  }
};

// Get all tuitions created by the authenticated tutor
const getTutorTuitions = async (req, res) => {
  try {
    const db = getDB();

    const tuitions = await db
      .collection("tuitions")
      .find({
        tutorId: new ObjectId(req.user.id),
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      message: "Your tuitions retrieved successfully.",
      total: tuitions.length,
      data: tuitions,
    });
  } catch (error) {
    console.error("Get Tutor Tuitions Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your tuitions.",
    });
  }
};

// Get all approved and active public tuitions
const getPublicTuitions = async (req, res) => {
  try {
    const db = getDB();

    const tuitions = await db
      .collection("tuitions")
      .find({
        status: "approved",
        isActive: true,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      message: "Public tuitions retrieved successfully.",
      total: tuitions.length,
      data: tuitions,
    });
  } catch (error) {
    console.error("Get Public Tuitions Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve public tuitions.",
    });
  }
};

// Search and filter public tuitions (Server-side)
const searchPublicTuitions = async (req, res) => {
  try {
    const db = getDB();

    const { search, subject, location, classLevel, mode } = req.query;

    // Pagination parameters (safe defaults + clamping)
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 12),
    );

    // Only approved and active tuitions are publicly visible
    const filter = {
      status: "approved",
      isActive: true,
    };

    // Search by title, subject, description or tutor name
    if (typeof search === "string" && search.trim()) {
      const keyword = escapeRegex(search.trim());

      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { subject: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { tutorName: { $regex: keyword, $options: "i" } },
      ];
    }

    // Subject filter
    if (typeof subject === "string" && subject.trim()) {
      filter.subject = {
        $regex: `^${escapeRegex(subject.trim())}$`,
        $options: "i",
      };
    }

    // Class level filter
    if (typeof classLevel === "string" && classLevel.trim()) {
      filter.classLevel = {
        $regex: `^${escapeRegex(classLevel.trim())}$`,
        $options: "i",
      };
    }

    // Online / Offline mode filter
    if (typeof mode === "string" && mode.trim()) {
      const normalizedMode = mode.trim().toLowerCase();

      if (!["online", "offline"].includes(normalizedMode)) {
        return res.status(400).json({
          success: false,
          message: "Mode must be online or offline.",
        });
      }

      filter.mode = {
        $regex: `^${escapeRegex(normalizedMode)}$`,
        $options: "i",
      };
    }

    // Location filter
    if (typeof location === "string" && location.trim()) {
      filter.location = {
        $regex: escapeRegex(location.trim()),
        $options: "i",
      };
    }

    const tuitionsCollection = db.collection("tuitions");

    const total = await tuitionsCollection.countDocuments(filter);
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    // Clamp out-of-range pages to the last available page (safe handling).
    const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages);
    const safeSkip = (safePage - 1) * limit;

    const tuitions = await tuitionsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(safeSkip)
      .limit(limit)
      .toArray();

    return res.status(200).json({
      success: true,
      message: "Tuition search completed successfully.",
      total,
      filters: {
        search: search || "",
        subject: subject || "",
        location: location || "",
        classLevel: classLevel || "",
        mode: mode || "",
      },
      data: tuitions,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      },
    });
  } catch (error) {
    console.error("Search Tuitions Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to search tuitions.",
    });
  }
};

// Get single approved and active tuition details
const getPublicTuitionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tuition ID.",
      });
    }

    const db = getDB();

    const tuition = await db.collection("tuitions").findOne({
      _id: new ObjectId(id),
      status: "approved",
      isActive: true,
    });

    if (!tuition) {
      return res.status(404).json({
        success: false,
        message: "Tuition not found or not available.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tuition details retrieved successfully.",
      data: tuition,
    });
  } catch (error) {
    console.error("Get Tuition Details Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve tuition details.",
    });
  }
};

// Update tutor's own tuition
const updateTutorTuition = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tuition ID.",
      });
    }

    const {
      title,
      subject,
      classLevel,
      mode,
      location,
      monthlyFee,
      daysPerWeek,
      description,
      bannerImage,
      isActive,
    } = req.body;

    const db = getDB();

    const tuition = await db.collection("tuitions").findOne({
      _id: new ObjectId(id),
      tutorId: new ObjectId(req.user.id),
    });

    if (!tuition) {
      return res.status(404).json({
        success: false,
        message: "Tuition not found or you do not own this tuition.",
      });
    }

    let updatedMonthlyFee = tuition.monthlyFee;

    if (monthlyFee !== undefined) {
      const min = Number(monthlyFee.min);
      const max = Number(monthlyFee.max);

      if (
        !Number.isFinite(min) ||
        !Number.isFinite(max) ||
        min <= 0 ||
        max < min
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid monthly fee range.",
        });
      }

      updatedMonthlyFee = {
        min,
        max,
        currency: "BDT",
        period: "monthly",
      };
    }

    let updatedDays = tuition.daysPerWeek;

    if (daysPerWeek !== undefined) {
      const days = Number(daysPerWeek);

      if (!Number.isInteger(days) || days < 1 || days > 7) {
        return res.status(400).json({
          success: false,
          message: "Days per week must be between 1 and 7.",
        });
      }

      updatedDays = days;
    }

    const updates = {
      updatedAt: new Date(),
    };

    const fields = {
      title,
      subject,
      classLevel,
      mode,
      location,
      description,
      bannerImage,
    };

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        if (typeof value !== "string" || !value.trim()) {
          return res.status(400).json({
            success: false,
            message: `${key} must be a non-empty string.`,
          });
        }

        updates[key] = value.trim();
      }
    }

    if (monthlyFee !== undefined) {
      updates.monthlyFee = updatedMonthlyFee;
    }

    if (daysPerWeek !== undefined) {
      updates.daysPerWeek = updatedDays;
    }

    // Allow tutor to activate or close their own tuition
    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be a boolean value.",
        });
      }

      updates.isActive = isActive;
    }

    const result = await db.collection("tuitions").updateOne(
      {
        _id: new ObjectId(id),
        tutorId: new ObjectId(req.user.id),
      },
      {
        $set: updates,
      },
    );

    if (!result.matchedCount) {
      return res.status(404).json({
        success: false,
        message: "Tuition not found.",
      });
    }

    const updatedTuition = await db.collection("tuitions").findOne({
      _id: new ObjectId(id),
    });

    return res.status(200).json({
      success: true,
      message: "Tuition updated successfully.",
      data: updatedTuition,
    });
  } catch (error) {
    console.error("Update Tuition Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update tuition.",
    });
  }
};

// Delete tutor's own tuition
const deleteTutorTuition = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tuition ID.",
      });
    }

    const db = getDB();

    const result = await db.collection("tuitions").deleteOne({
      _id: new ObjectId(id),
      tutorId: new ObjectId(req.user.id),
    });

    if (!result.deletedCount) {
      return res.status(404).json({
        success: false,
        message: "Tuition not found or you do not own this tuition.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tuition deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Tuition Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete tuition.",
    });
  }
};

// Admin: Get all tuitions
const getAllTuitions = async (req, res) => {
  try {
    const db = getDB();

    const tuitions = await db
      .collection("tuitions")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      message: "All tuitions retrieved successfully.",
      total: tuitions.length,
      data: tuitions,
    });
  } catch (error) {
    console.error("Get All Tuitions Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve all tuitions.",
    });
  }
};

// Admin: Approve or reject a tuition
const updateTuitionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tuition ID.",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected.",
      });
    }

    const db = getDB();

    const result = await db.collection("tuitions").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Tuition not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Tuition ${status} successfully.`,
    });
  } catch (error) {
    console.error("Update Tuition Status Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update tuition status.",
    });
  }
};

export {
  createTuition,
  getTutorTuitions,
  getPublicTuitions,
  searchPublicTuitions,
  getPublicTuitionById,
  updateTutorTuition,
  deleteTutorTuition,
  getAllTuitions,
  updateTuitionStatus,
};
