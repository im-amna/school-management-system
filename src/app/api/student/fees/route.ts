// src/app/api/student/fees/route.ts
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
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const fees = await prisma.fee.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(fees, { status: 200 });
  } catch (error) {
    console.error("[GET /api/student/fees]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH — student marks their own fee as paid
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { feeId } = await req.json();

    if (!feeId) {
      return NextResponse.json({ error: "feeId is required" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Make sure this fee belongs to this student
    const fee = await prisma.fee.findUnique({ where: { id: feeId } });

    if (!fee) {
      return NextResponse.json({ error: "Fee not found" }, { status: 404 });
    }

    if (fee.studentId !== student.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (fee.status === "PAID") {
      return NextResponse.json({ error: "Already paid" }, { status: 400 });
    }

    const updated = await prisma.fee.update({
      where: { id: feeId },
      data: { status: "PAID", paidAt: new Date() },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/student/fees]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}