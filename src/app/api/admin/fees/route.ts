// src/app/api/admin/fees/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

// GET /api/admin/fees
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const fees = await prisma.fee.findMany({
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            class: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(fees, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/fees]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST /api/admin/fees
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { studentId, amount, description, dueDate } = body;

    if (!studentId || !amount || !description || !dueDate) {
      return NextResponse.json(
        { error: "studentId, amount, description, and dueDate are required" },
        { status: 400 },
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const fee = await prisma.fee.create({
      data: {
        studentId,
        amount: Number(amount),
        description,
        dueDate: new Date(dueDate),
        status: "PENDING",
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    // Notify the student about the new fee
    await createNotification(
      fee.student.userId,
      `A new fee has been added: ${fee.description} — PKR ${fee.amount.toLocaleString()}, due ${new Date(dueDate).toLocaleDateString()}.`,
      "FEE",
    );

    return NextResponse.json(fee, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/fees]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
