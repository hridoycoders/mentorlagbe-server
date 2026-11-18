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

  console.log("MongoDB Indexes Created Successfully!");
};

export default createIndexes;
