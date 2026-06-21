// src/app/api/student/results/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/student/results — View own results
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const results = await prisma.result.findMany({
      where: { studentId: student.id },
      include: {
        class: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("[GET /api/student/results]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}