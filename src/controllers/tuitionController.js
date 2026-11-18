import { getDB } from "../config/db.js";

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

export { getPublicTuitions };
