// src/app/api/teacher/results/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

// GET /api/teacher/results — View all results
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const results = await prisma.result.findMany({
      where: {
        class: { teacherId: teacher.id },
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        class: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("[GET /api/teacher/results]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/teacher/results — Add a result
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { studentId, classId, subject, marks, totalMarks } = body;

    if (!studentId || !classId || !subject || marks === undefined || !totalMarks) {
      return NextResponse.json(
        { error: "studentId, classId, subject, marks, and totalMarks are required" },
        { status: 400 }
      );
    }

    if (marks > totalMarks) {
      return NextResponse.json(
        { error: "marks cannot be greater than totalMarks" },
        { status: 400 }
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Check class belongs to this teacher
    const cls = await prisma.class.findFirst({
      where: { id: classId, teacherId: teacher.id },
    });

    if (!cls) {
      return NextResponse.json(
        { error: "Class not found or not assigned to you" },
        { status: 403 }
      );
    }

    const result = await prisma.result.create({
  data: {
    studentId,
    classId,
    subject,
    marks: Number(marks),
    totalMarks: Number(totalMarks),
    addedById: session.user.id,
  },
  include: {
    student: {
      include: {
        user: { select: { name: true, email: true } },
      },
    },
    class: true,
  },
});

// Notify the student that a new result was added
await createNotification(
  result.student.userId,
  `Your result for ${result.subject} has been added: ${result.marks}/${result.totalMarks}.`,
  "RESULT"
);

return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[POST /api/teacher/results]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}