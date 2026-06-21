// src/app/api/student/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { name: true, email: true } },
        class: {
          include: {
            teacher: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
        },
        attendance: { select: { status: true } },
        results: {
          select: { marks: true, totalMarks: true, subject: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student, { status: 200 });
  } catch (error) {
    console.error("[GET /api/student/profile]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}