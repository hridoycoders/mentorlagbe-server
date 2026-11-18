import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

const createApplication = async (req, res) => {
  try {
    const { tuitionId, message = "" } = req.body;

    if (!tuitionId || !ObjectId.isValid(tuitionId)) {
      return res.status(400).json({
        success: false,
        message: "A valid tuition ID is required.",
      });
    }

    const db = getDB();

    // Find an approved and active tuition
    const tuition = await db.collection("tuitions").findOne({
      _id: new ObjectId(tuitionId),
      status: "approved",
      isActive: true,
    });

    if (!tuition) {
      return res.status(404).json({
        success: false,
        message: "Tuition not found or not available for application.",
      });
    }

    // Prevent tutor from applying to their own tuition
    if (tuition.tutorId.toString() === req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You cannot apply to your own tuition.",
      });
    }

    const now = new Date();

    const newApplication = {
      tuitionId: new ObjectId(tuitionId),
      tuitionTitle: tuition.title,

      tutorId: tuition.tutorId,
      tutorName: tuition.tutorName,

      studentId: new ObjectId(req.user.id),
      studentName: req.user.name,
      studentEmail: req.user.email,

      message: message.trim(),
      status: "pending",

      createdAt: now,
      updatedAt: now,
    };

    const result = await db
      .collection("applications")
      .insertOne(newApplication);

    return res.status(201).json({
      success: true,
      message: "Tuition application submitted successfully.",
      data: {
        _id: result.insertedId,
        ...newApplication,
      },
    });
  } catch (error) {
    console.error("Create Application Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit application.",
    });
  }
};

export { createApplication };
