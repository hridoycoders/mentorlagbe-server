import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

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

// Search and filter public tuitions
const searchPublicTuitions = async (req, res) => {
  try {
    const db = getDB();

    const { search, subject, location, classLevel } = req.query;

    const filter = {
      status: "approved",
      isActive: true,
    };

    if (search?.trim()) {
      const keyword = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { subject: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    if (subject?.trim()) {
      filter.subject = {
        $regex: `^${subject.trim()}$`,
        $options: "i",
      };
    }

    if (location?.trim()) {
      filter.location = {
        $regex: location.trim(),
        $options: "i",
      };
    }

    if (classLevel?.trim()) {
      filter.classLevel = {
        $regex: `^${classLevel.trim()}$`,
        $options: "i",
      };
    }

    const tuitions = await db
      .collection("tuitions")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      message: "Tuition search completed successfully.",
      total: tuitions.length,
      filters: { search, subject, location, classLevel },
      data: tuitions,
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

export { getPublicTuitions, searchPublicTuitions, getPublicTuitionById };
