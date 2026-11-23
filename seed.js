import "dotenv/config";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing.");
}

if (!DB_NAME) {
  throw new Error("DB_NAME is missing.");
}

const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const seedTutors = [
  {
    seedKey: "seed-tutor-ayesha-rahman",
    name: "Ayesha Rahman",
    email: "seed.ayesha.rahman@mentorlagbe.seed",
    role: "tutor",
    plan: "pro",
  },
  {
    seedKey: "seed-tutor-tanvir-hasan",
    name: "Tanvir Hasan",
    email: "seed.tanvir.hasan@mentorlagbe.seed",
    role: "tutor",
    plan: "free",
  },
  {
    seedKey: "seed-tutor-nusrat-jahan",
    name: "Nusrat Jahan",
    email: "seed.nusrat.jahan@mentorlagbe.seed",
    role: "tutor",
    plan: "free",
  },
  {
    seedKey: "seed-tutor-rakib-hossain",
    name: "Rakib Hossain",
    email: "seed.rakib.hossain@mentorlagbe.seed",
    role: "tutor",
    plan: "pro",
  },
];

const tuitionTemplates = [
  // Ayesha Rahman — Mathematics & Physics (pro)
  {
    seedKey: "seed-tuition-math-class9-online",
    tutorKey: "seed-tutor-ayesha-rahman",
    title: "Mathematics Tutor for Class 9",
    subject: "Mathematics",
    classLevel: "Class 9",
    mode: "Online",
    location: "Online",
    monthlyFee: { min: 3000, max: 4000, currency: "BDT", period: "monthly" },
    daysPerWeek: 3,
    description:
      "Comprehensive mathematics coaching for Class 9 students. Covers algebra, geometry, and trigonometry with weekly practice tests and doubt-clearing sessions.",
  },
  {
    seedKey: "seed-tuition-physics-class10-offline",
    tutorKey: "seed-tutor-ayesha-rahman",
    title: "Physics Coaching for Class 10",
    subject: "Physics",
    classLevel: "Class 10",
    mode: "Offline",
    location: "Dhaka",
    monthlyFee: { min: 4000, max: 5000, currency: "BDT", period: "monthly" },
    daysPerWeek: 2,
    description:
      "In-depth physics preparation for Class 10. Focus on mechanics, optics, and electricity with hands-on problem solving and exam-oriented revision.",
  },
  {
    seedKey: "seed-tuition-higher-math-class11-online",
    tutorKey: "seed-tutor-ayesha-rahman",
    title: "Higher Mathematics for Class 11",
    subject: "Higher Mathematics",
    classLevel: "Class 11",
    mode: "Online",
    location: "Online",
    monthlyFee: { min: 5000, max: 6000, currency: "BDT", period: "monthly" },
    daysPerWeek: 3,
    description:
      "Advanced higher mathematics coaching covering calculus, vectors, and coordinate geometry. Ideal for students aiming for strong board and admission results.",
  },

  // Tanvir Hasan — Chemistry & Biology (free)
  {
    seedKey: "seed-tuition-chemistry-class9-online",
    tutorKey: "seed-tutor-tanvir-hasan",
    title: "Chemistry Tutor for Class 9",
    subject: "Chemistry",
    classLevel: "Class 9",
    mode: "Online",
    location: "Online",
    monthlyFee: { min: 3000, max: 3500, currency: "BDT", period: "monthly" },
    daysPerWeek: 2,
    description:
      "Structured chemistry lessons for Class 9 students. Covers atomic structure, periodic table, and basic reactions with regular quizzes.",
  },
  {
    seedKey: "seed-tuition-biology-class10-offline",
    tutorKey: "seed-tutor-tanvir-hasan",
    title: "Biology Coaching for Class 10",
    subject: "Biology",
    classLevel: "Class 10",
    mode: "Offline",
    location: "Chittagong",
    monthlyFee: { min: 3500, max: 4500, currency: "BDT", period: "monthly" },
    daysPerWeek: 2,
    description:
      "Biology preparation for Class 10 with focus on cell biology, genetics, and human physiology. Includes diagram practice and revision notes.",
  },
  {
    seedKey: "seed-tuition-general-science-class8-online",
    tutorKey: "seed-tutor-tanvir-hasan",
    title: "General Science for Class 8",
    subject: "General Science",
    classLevel: "Class 8",
    mode: "Online",
    location: "Online",
    monthlyFee: { min: 2500, max: 3000, currency: "BDT", period: "monthly" },
    daysPerWeek: 2,
    description:
      "Foundational science coaching for Class 8 students covering physics, chemistry, and biology basics with interactive examples.",
  },

  // Nusrat Jahan — English & Bangla (free)
  {
    seedKey: "seed-tuition-english-class10-online",
    tutorKey: "seed-tutor-nusrat-jahan",
    title: "English Tutor for Class 10",
    subject: "English",
    classLevel: "Class 10",
    mode: "Online",
    location: "Online",
    monthlyFee: { min: 3000, max: 4000, currency: "BDT", period: "monthly" },
    daysPerWeek: 3,
    description:
      "English language and literature coaching for Class 10. Improves grammar, comprehension, and writing skills with regular feedback.",
  },
  {
    seedKey: "seed-tuition-bangla-class9-offline",
    tutorKey: "seed-tutor-nusrat-jahan",
    title: "Bangla Tutor for Class 9",
    subject: "Bangla",
    classLevel: "Class 9",
    mode: "Offline",
    location: "Sylhet",
    monthlyFee: { min: 2500, max: 3000, currency: "BDT", period: "monthly" },
    daysPerWeek: 2,
    description:
      "Bangla language and literature coaching for Class 9. Covers grammar, composition, and prose/poetry analysis.",
  },
  {
    seedKey: "seed-tuition-ielts-prep-online",
    tutorKey: "seed-tutor-nusrat-jahan",
    title: "IELTS Preparation Course",
    subject: "IELTS",
    classLevel: "IELTS",
    mode: "Online",
    location: "Online",
    monthlyFee: { min: 6000, max: 8000, currency: "BDT", period: "monthly" },
    daysPerWeek: 4,
    description:
      "Comprehensive IELTS preparation covering listening, reading, writing, and speaking. Includes mock tests and personalized feedback.",
  },

  // Rakib Hossain — ICT & Programming (pro)
  {
    seedKey: "seed-tuition-ict-class9-online",
    tutorKey: "seed-tutor-rakib-hossain",
    title: "ICT Tutor for Class 9",
    subject: "ICT",
    classLevel: "Class 9",
    mode: "Online",
    location: "Online",
    monthlyFee: { min: 3000, max: 4000, currency: "BDT", period: "monthly" },
    daysPerWeek: 2,
    description:
      "ICT coaching for Class 9 students covering computer fundamentals, networking basics, and spreadsheet applications.",
  },
  {
    seedKey: "seed-tuition-programming-basics-offline",
    tutorKey: "seed-tutor-rakib-hossain",
    title: "Programming Basics for Beginners",
    subject: "Programming",
    classLevel: "Class 10",
    mode: "Offline",
    location: "Dhaka",
    monthlyFee: { min: 5000, max: 6000, currency: "BDT", period: "monthly" },
    daysPerWeek: 3,
    description:
      "Introduction to programming with hands-on practice. Covers basic concepts, problem solving, and simple project building.",
  },
  {
    seedKey: "seed-tuition-computer-science-class10-online",
    tutorKey: "seed-tutor-rakib-hossain",
    title: "Computer Science for Class 10",
    subject: "Computer Science",
    classLevel: "Class 10",
    mode: "Online",
    location: "Online",
    monthlyFee: { min: 4000, max: 5000, currency: "BDT", period: "monthly" },
    daysPerWeek: 2,
    description:
      "Computer science coaching for Class 10 covering algorithms, data representation, and programming fundamentals.",
  },
];

const run = async () => {
  await client.connect();
  await client.db("admin").command({ ping: 1 });

  const db = client.db(DB_NAME);
  const users = db.collection("users");
  const tuitions = db.collection("tuitions");

  const now = new Date();

  let tutorsInserted = 0;
  let tutorsExisting = 0;
  const tutorIds = {};

  for (const tutor of seedTutors) {
    const result = await users.updateOne(
      { email: tutor.email },
      {
        $setOnInsert: {
          _id: new ObjectId(),
          name: tutor.name,
          email: tutor.email,
          role: tutor.role,
          plan: tutor.plan,
          image: "",
          phone: "",
          bio: "",
          emailVerified: false,
          seedKey: tutor.seedKey,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true },
    );

    if (result.upsertedCount > 0) {
      tutorsInserted += 1;
    } else {
      tutorsExisting += 1;
    }

    const storedTutor = await users.findOne({ email: tutor.email });

    if (!storedTutor || storedTutor.seedKey !== tutor.seedKey) {
      throw new Error(`Could not resolve seed tutor: ${tutor.email}`);
    }

    tutorIds[tutor.seedKey] = storedTutor._id;
  }

  let tuitionsInserted = 0;
  let tuitionsExisting = 0;

  for (const template of tuitionTemplates) {
    const tutorId = tutorIds[template.tutorKey];

    if (!tutorId) {
      throw new Error(`Missing tutor for tuition: ${template.seedKey}`);
    }

    const tutor = seedTutors.find((item) => item.seedKey === template.tutorKey);

    const tuitionDocument = {
      title: template.title,
      subject: template.subject,
      classLevel: template.classLevel,
      mode: template.mode,
      location: template.location,
      monthlyFee: {
        min: template.monthlyFee.min,
        max: template.monthlyFee.max,
        currency: template.monthlyFee.currency,
        period: template.monthlyFee.period,
      },
      daysPerWeek: template.daysPerWeek,
      description: template.description,
      bannerImage: "",

      tutorId,
      tutorName: tutor.name,
      tutorEmail: tutor.email,

      status: "approved",
      isActive: true,

      seedKey: template.seedKey,

      createdAt: now,
      updatedAt: now,
    };

    const result = await tuitions.updateOne(
      { seedKey: template.seedKey },
      { $setOnInsert: tuitionDocument },
      { upsert: true },
    );

    if (result.upsertedCount > 0) {
      tuitionsInserted += 1;
    } else {
      tuitionsExisting += 1;
    }
  }

  const approvedActiveCount = await tuitions.countDocuments({
    status: "approved",
    isActive: true,
  });

  console.log("Seed completed successfully.");
  console.log(`Tutors inserted: ${tutorsInserted}, already present: ${tutorsExisting}`);
  console.log(`Tuitions inserted: ${tuitionsInserted}, already present: ${tuitionsExisting}`);
  console.log(`Total approved & active tuitions: ${approvedActiveCount}`);
};

const main = async () => {
  try {
    await run();
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
};

main();
