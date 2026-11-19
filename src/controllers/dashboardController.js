import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

// Student Dashboard Statistics
export const getStudentStats = async (req, res) => {
  try {
    const db = getDB();
    const studentId = new ObjectId(req.user.id);

    const applications = db.collection("applications");

    const [
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
    ] = await Promise.all([
      applications.countDocuments({ studentId }),
      applications.countDocuments({ studentId, status: "pending" }),
      applications.countDocuments({ studentId, status: "accepted" }),
      applications.countDocuments({ studentId, status: "rejected" }),
    ]);

    const user = await db
      .collection("users")
      .findOne({ _id: studentId }, { projection: { plan: 1 } });

    return res.status(200).json({
      success: true,
      message: "Student dashboard statistics retrieved successfully.",
      data: {
        plan: user?.plan || "free",
        totalApplications,
        pendingApplications,
        acceptedApplications,
        rejectedApplications,
      },
    });
  } catch (error) {
    console.error("Get student dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve student dashboard statistics.",
    });
  }
};


// Tutor Dashboard Statistics
export const getTutorStats = async (req, res) => {
  try {
    const db = getDB();
    const tutorId = new ObjectId(req.user.id);

    const tuitions = db.collection("tuitions");
    const applications = db.collection("applications");

    const [
      totalTuitions,
      activeTuitions,
      approvedTuitions,
      pendingTuitions,
      rejectedTuitions,
      totalApplicants,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
    ] = await Promise.all([
      tuitions.countDocuments({ tutorId }),
      tuitions.countDocuments({ tutorId, isActive: true }),
      tuitions.countDocuments({ tutorId, status: "approved" }),
      tuitions.countDocuments({ tutorId, status: "pending" }),
      tuitions.countDocuments({ tutorId, status: "rejected" }),
      applications.countDocuments({ tutorId }),
      applications.countDocuments({ tutorId, status: "pending" }),
      applications.countDocuments({ tutorId, status: "accepted" }),
      applications.countDocuments({ tutorId, status: "rejected" }),
    ]);

    const user = await db.collection("users").findOne(
      { _id: tutorId },
      { projection: { plan: 1 } },
    );

    return res.status(200).json({
      success: true,
      message: "Tutor dashboard statistics retrieved successfully.",
      data: {
        plan: user?.plan || "free",
        totalTuitions,
        activeTuitions,
        approvedTuitions,
        pendingTuitions,
        rejectedTuitions,
        totalApplicants,
        pendingApplications,
        acceptedApplications,
        rejectedApplications,
      },
    });
  } catch (error) {
    console.error("Get tutor dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve tutor dashboard statistics.",
    });
  }
};

// Admin Dashboard Statistics
export const getAdminStats = async (req, res) => {
  try {
    const db = getDB();

    const users = db.collection("users");
    const tuitions = db.collection("tuitions");
    const applications = db.collection("applications");
    const payments = db.collection("payments");

    const [
      totalUsers,
      totalStudents,
      totalTutors,
      totalAdmins,
      totalTuitions,
      pendingTuitions,
      approvedTuitions,
      rejectedTuitions,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      revenueResult,
    ] = await Promise.all([
      users.countDocuments(),
      users.countDocuments({ role: "student" }),
      users.countDocuments({ role: "tutor" }),
      users.countDocuments({ role: "admin" }),

      tuitions.countDocuments(),
      tuitions.countDocuments({ status: "pending" }),
      tuitions.countDocuments({ status: "approved" }),
      tuitions.countDocuments({ status: "rejected" }),

      applications.countDocuments(),
      applications.countDocuments({ status: "pending" }),
      applications.countDocuments({ status: "accepted" }),
      applications.countDocuments({ status: "rejected" }),

      payments.aggregate([
        { $match: { paymentStatus: "paid" } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
            totalTransactions: { $sum: 1 },
          },
        },
      ]).toArray(),
    ]);

    const revenue = revenueResult[0] || {
      totalRevenue: 0,
      totalTransactions: 0,
    };

    return res.status(200).json({
      success: true,
      message: "Admin dashboard statistics retrieved successfully.",
      data: {
        users: {
          total: totalUsers,
          students: totalStudents,
          tutors: totalTutors,
          admins: totalAdmins,
        },
        tuitions: {
          total: totalTuitions,
          pending: pendingTuitions,
          approved: approvedTuitions,
          rejected: rejectedTuitions,
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          accepted: acceptedApplications,
          rejected: rejectedApplications,
        },
        payments: {
          totalTransactions: revenue.totalTransactions,
          totalRevenue: revenue.totalRevenue,
        },
      },
    });
  } catch (error) {
    console.error("Get admin dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve admin dashboard statistics.",
    });
  }
};

// Admin: Get All Payment Transactions
export const getAllTransactions = async (req, res) => {
  try {
    const db = getDB();

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10),
    );

    const skip = (page - 1) * limit;

    const payments = db.collection("payments");

    const [total, transactions] = await Promise.all([
      payments.countDocuments(),
      payments
        .find(
          {},
          {
            projection: {
              userId: 1,
              userName: 1,
              userEmail: 1,
              userRole: 1,
              planName: 1,
              amount: 1,
              currency: 1,
              paymentStatus: 1,
              sessionId: 1,
              paymentIntentId: 1,
              createdAt: 1,
            },
          },
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Payment transactions retrieved successfully.",
      data: {
        transactions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all transactions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve payment transactions.",
    });
  }
};
