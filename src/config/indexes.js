import { getDB } from "./db.js";

const createIndexes = async () => {
  const db = getDB();

  await db.collection("applications").createIndex(
    {
      tuitionId: 1,
      studentId: 1,
    },
    {
      unique: true,
      name: "unique_student_tuition_application",
    },
  );

  await db.collection("payments").createIndex(
    { sessionId: 1 },
    {
      unique: true,
      name: "unique_stripe_session",
    },
  );

  await db.collection("tuitions").createIndex(
    { seedKey: 1 },
    {
      unique: true,
      name: "unique_tuition_seed_key",
      partialFilterExpression: {
        $and: [
          { seedKey: { $type: "string" } },
          { seedKey: { $gt: "" } },
        ],
      },
    },
  );

  console.log("MongoDB Indexes Created Successfully!");
};

export default createIndexes;
