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

    if (tuition.tutorId.toString() === req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You cannot apply to your own tuition.",
      });
    }

    const existingApplication = await db.collection("applications").findOne({
      tuitionId: new ObjectId(tuitionId),
      studentId: new ObjectId(req.user.id),
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this tuition.",
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

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this tuition.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit application.",
    });
  }
};

// Student: Get own applications
const getStudentApplications = async (req, res) => {
  try {
    const db = getDB();

    const applications = await db
      .collection("applications")
      .find({
        studentId: new ObjectId(req.user.id),
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      message: "Student applications retrieved successfully.",
      total: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error("Get Student Applications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve student applications.",
    });
  }
};

// Tutor: Get all applications for own tuitions
const getTutorApplications = async (req, res) => {
  try {
    const db = getDB();

    const applications = await db
      .collection("applications")
      .find({
        tutorId: new ObjectId(req.user.id),
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      message: "Tutor applications retrieved successfully.",
      total: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error("Get Tutor Applications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve applications.",
    });
  }
};

const getTutorApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    const db = getDB();

    const application = await db.collection("applications").findOne({
      _id: new ObjectId(id),
      tutorId: new ObjectId(req.user.id),
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Application details retrieved successfully.",
      data: application,
    });
  } catch (error) {
    console.error("Get Tutor Application Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve application details.",
    });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be accepted or rejected.",
      });
    }

    const db = getDB();

    const result = await db.collection("applications").updateOne(
      {
        _id: new ObjectId(id),
        tutorId: new ObjectId(req.user.id),
        status: "pending",
      },
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
        message: "Pending application not found or you do not have permission.",
      });
    }

    const updatedApplication = await db.collection("applications").findOne({
      _id: new ObjectId(id),
    });

    return res.status(200).json({
      success: true,
      message: `Application ${status} successfully.`,
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Update Application Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update application status.",
    });
  }
};

export {
  createApplication,
  getStudentApplications,
  getTutorApplications,
  updateApplicationStatus,
  getTutorApplicationById,
};
