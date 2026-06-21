// src/app/api/admin/teachers/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/teachers/:id
export async function GET(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, name: true, role: true },
        },
        classes: true,
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json(teacher, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/teachers/:id]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/admin/teachers/:id
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { name, email, password, subject } = body;

    const existing = await prisma.teacher.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    if (email && email !== existing.user.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
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

      const updated = await tx.teacher.update({
        where: { id },
        data: {
          ...(subject ? { subject } : {}),
        },
        include: {
          user: {
            select: { id: true, email: true, name: true, role: true },
          },
          classes: true,
        },
      });

      return updated;
    }, { timeout: 30000 });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/admin/teachers/:id]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/admin/teachers/:id
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.teacher.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: existing.userId } });

    return NextResponse.json({ message: "Teacher deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/admin/teachers/:id]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}