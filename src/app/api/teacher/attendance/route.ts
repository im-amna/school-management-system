// src/app/api/teacher/attendance/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

// GET /api/teacher/attendance — View attendance records
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Pehle teacher record dhundo session user se
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Is teacher ki classes ki attendance fetch karo
    const attendance = await prisma.attendance.findMany({
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
      orderBy: { date: "desc" },
    });

    return NextResponse.json(attendance, { status: 200 });
  } catch (error) {
    console.error("[GET /api/teacher/attendance]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/teacher/attendance — Mark attendance
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { studentId, classId, date, status } = body;

    if (!studentId || !classId || !date || !status) {
      return NextResponse.json(
        { error: "studentId, classId, date, and status are required" },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ["PRESENT", "ABSENT", "LATE"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "status must be PRESENT, ABSENT, or LATE" },
        { status: 400 }
      );
    }

    // Teacher ka record dhundo
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Check karo yeh class is teacher ki hai
    const cls = await prisma.class.findFirst({
      where: { id: classId, teacherId: teacher.id },
    });

    if (!cls) {
      return NextResponse.json(
        { error: "Class not found or not assigned to you" },
        { status: 403 }
      );
    }

    // Duplicate attendance check — same student, class, date
    const existing = await prisma.attendance.findFirst({
      where: {
        studentId,
        classId,
        date: new Date(date),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Attendance already marked for this student on this date" },
        { status: 409 }
      );
    }

    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        classId,
        date: new Date(date),
        status,
        markedById: session.user.id,
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

    // Notify the student that their attendance was marked
    await createNotification(
      attendance.student.userId,
      `Your attendance for ${attendance.class.name} - ${attendance.class.section} on ${new Date(date).toLocaleDateString()} was marked as ${status}.`,
      "ATTENDANCE"
    );

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error("[POST /api/teacher/attendance]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}