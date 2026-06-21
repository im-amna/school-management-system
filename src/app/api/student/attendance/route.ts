// src/app/api/student/attendance/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/student/attendance — View own attendance
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Session se student dhundo
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const attendance = await prisma.attendance.findMany({
      where: { studentId: student.id },
      include: {
        class: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(attendance, { status: 200 });
  } catch (error) {
    console.error("[GET /api/student/attendance]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}