// src/app/api/admin/students/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/students/:id — Fetch single student
export async function GET(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, name: true, role: true },
        },
        class: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/students/:id]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/admin/students/:id — Update student
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { name, email, password, rollNumber, classId } = body;

    const existing = await prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (email && email !== existing.user.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    if (rollNumber && rollNumber !== existing.rollNumber) {
      const rollTaken = await prisma.student.findUnique({ where: { rollNumber } });
      if (rollTaken) {
        return NextResponse.json({ error: "Roll number already in use" }, { status: 409 });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: existing.userId },
        data: {
          ...(name ? { name } : {}),
          ...(email ? { email } : {}),
          ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
        },
      });

      const updated = await tx.student.update({
        where: { id },
        data: {
          ...(rollNumber ? { rollNumber } : {}),
          ...(classId ? { classId } : {}),
        },
        include: {
          user: {
            select: { id: true, email: true, name: true, role: true },
          },
          class: true,
        },
      });

      return updated;
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/admin/students/:id]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/admin/students/:id — Delete student + linked user
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.student.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: existing.userId } });

    return NextResponse.json({ message: "Student deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/admin/students/:id]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}