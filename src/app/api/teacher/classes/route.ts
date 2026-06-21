// src/app/api/teacher/classes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/teacher/classes — Logged-in teacher ki apni classes (with students)
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

    const classes = await prisma.class.findMany({
      where: { teacherId: teacher.id },
      include: {
        students: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json(classes, { status: 200 });
  } catch (error) {
    console.error("[GET /api/teacher/classes]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}