// src/app/api/teacher/results/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// PUT /api/teacher/results/:id — Edit a result
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { subject, marks, totalMarks } = body;

    const existing = await prisma.result.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    // Check this result was added by this teacher
    if (existing.addedById !== session.user.id) {
      return NextResponse.json(
        { error: "You can only edit your own results" },
        { status: 403 }
      );
    }

    const finalMarks = marks !== undefined ? Number(marks) : existing.marks;
    const finalTotal = totalMarks ? Number(totalMarks) : existing.totalMarks;

    if (finalMarks > finalTotal) {
      return NextResponse.json(
        { error: "marks cannot be greater than totalMarks" },
        { status: 400 }
      );
    }

    const updated = await prisma.result.update({
      where: { id },
      data: {
        ...(subject ? { subject } : {}),
        ...(marks !== undefined ? { marks: Number(marks) } : {}),
        ...(totalMarks ? { totalMarks: Number(totalMarks) } : {}),
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

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/teacher/results/:id]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/teacher/results/:id
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.result.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    if (existing.addedById !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own results" },
        { status: 403 }
      );
    }

    await prisma.result.delete({ where: { id } });

    return NextResponse.json({ message: "Result deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/teacher/results/:id]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}