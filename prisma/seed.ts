// prisma/seed.ts
// This script populates the database with realistic demo data
// Run with: npx prisma db seed

import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Helper: create a user only if the email doesn't already exist
async function createUserIfNotExists(
  name: string,
  email: string,
  password: string,
  role: "ADMIN" | "TEACHER" | "STUDENT",
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { name, email, password: hashedPassword, role },
  });
}

async function main() {
  console.log("🌱 Seeding database...");

  // ---------- TEACHERS ----------
  const teacherData = [
    {
      name: "Sarah Ahmed",
      email: "sarah.ahmed@school.com",
      subject: "Mathematics",
    },
    { name: "Bilal Khan", email: "bilal.khan@school.com", subject: "Physics" },
    {
      name: "Ayesha Malik",
      email: "ayesha.malik@school.com",
      subject: "English",
    },
    {
      name: "Hassan Raza",
      email: "hassan.raza@school.com",
      subject: "Computer Science",
    },
    {
      name: "Fatima Iqbal",
      email: "fatima.iqbal@school.com",
      subject: "Biology",
    },
  ];

  const teachers = [];
  for (const t of teacherData) {
    const user = await createUserIfNotExists(
      t.name,
      t.email,
      "teacher123",
      "TEACHER",
    );
    const teacher = await prisma.teacher.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, subject: t.subject },
    });
    teachers.push(teacher);
  }
  console.log(`✅ ${teachers.length} teachers ready`);

  // ---------- CLASSES ----------
  const classData = [
    { name: "9th Grade", section: "A", year: 2026, teacherIndex: 0 },
    { name: "9th Grade", section: "B", year: 2026, teacherIndex: 1 },
    { name: "10th Grade", section: "A", year: 2026, teacherIndex: 2 },
    { name: "10th Grade", section: "B", year: 2026, teacherIndex: 3 },
    { name: "11th Grade", section: "A", year: 2026, teacherIndex: 4 },
  ];

  const classes = [];
  for (const c of classData) {
    const existing = await prisma.class.findFirst({
      where: { name: c.name, section: c.section, year: c.year },
    });
    if (existing) {
      classes.push(existing);
      continue;
    }
    const cls = await prisma.class.create({
      data: {
        name: c.name,
        section: c.section,
        year: c.year,
        teacherId: teachers[c.teacherIndex].id,
      },
    });
    classes.push(cls);
  }
  console.log(`✅ ${classes.length} classes ready`);

  // ---------- STUDENTS ----------
  const firstNames = [
    "Ali",
    "Zainab",
    "Usman",
    "Hira",
    "Ahmed",
    "Mahnoor",
    "Saad",
    "Areeba",
    "Faizan",
    "Khadija",
    "Omar",
    "Sana",
    "Bilawal",
    "Iqra",
    "Danish",
    "Maira",
    "Hamza",
    "Noor",
    "Talha",
    "Eman",
    "Rayyan",
    "Laiba",
    "Zeeshan",
    "Amna",
    "Asad",
  ];
  const lastNames = [
    "Khan",
    "Ahmed",
    "Malik",
    "Raza",
    "Iqbal",
    "Sheikh",
    "Butt",
    "Hussain",
    "Qureshi",
    "Farooq",
  ];

  let rollCounter = 100;
  const students = [];

  for (let i = 0; i < firstNames.length; i++) {
    const name = `${firstNames[i]} ${lastNames[i % lastNames.length]}`;
    const email = `${firstNames[i].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}@student.com`;
    const rollNumber = `S-${rollCounter++}`;
    const classForStudent = classes[i % classes.length];

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) continue; // skip if already seeded

    const user = await createUserIfNotExists(
      name,
      email,
      "student123",
      "STUDENT",
    );
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        rollNumber,
        classId: classForStudent.id,
      },
    });
    students.push(student);
  }
  console.log(`✅ ${students.length} new students created`);

  // Fetch all students (old + new) so attendance/results cover everyone
  const allStudents = await prisma.student.findMany({
    include: { class: true },
  });

  // ---------- ATTENDANCE (last 10 days) ----------
  let attendanceCount = 0;
  const statuses = ["PRESENT", "PRESENT", "PRESENT", "ABSENT", "LATE"]; // weighted towards present

  for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0);

    for (const student of allStudents) {
      if (!student.classId) continue;
      const existing = await prisma.attendance.findFirst({
        where: { studentId: student.id, classId: student.classId, date },
      });
      if (existing) continue;

      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          classId: student.classId,
          date,
          status: randomStatus as "PRESENT" | "ABSENT" | "LATE",
          markedById: allStudents[0].userId,
        },
      });
      attendanceCount++;
    }
  }
  console.log(`✅ ${attendanceCount} attendance records created`);

  // ---------- RESULTS (3 subjects per student) ----------
  const subjects = ["Mathematics", "English", "Science"];
  let resultCount = 0;

  for (const student of allStudents) {
    for (const subject of subjects) {
      if (!student.classId) continue;
      const existing = await prisma.result.findFirst({
        where: { studentId: student.id, subject },
      });
      if (existing) continue;

      const marks = Math.floor(Math.random() * 40) + 60; // 60-100 range
      await prisma.result.create({
        data: {
          studentId: student.id,
          classId: student.classId,
          subject,
          marks,
          totalMarks: 100,
          addedById: student.userId,
        },
      });
      resultCount++;
    }
  }
  console.log(`✅ ${resultCount} result records created`);

  // ---------- FEES (1 per student) ----------
  let feeCount = 0;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 15);

  for (const student of allStudents) {
    const existing = await prisma.fee.findFirst({
      where: { studentId: student.id },
    });
    if (existing) continue;

    const isPaid = Math.random() > 0.4; // ~60% paid
    await prisma.fee.create({
      data: {
        studentId: student.id,
        amount: 15000,
        description: "Monthly Tuition Fee",
        dueDate,
        status: isPaid ? "PAID" : "PENDING",
        paidAt: isPaid ? new Date() : null,
      },
    });
    feeCount++;
  }
  console.log(`✅ ${feeCount} fee records created`);

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
