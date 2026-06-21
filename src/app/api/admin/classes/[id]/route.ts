// src/app/api/admin/classes/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/classes/:id
export async function GET(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const cls = await prisma.class.findUnique({
      where: { id },
      include: {
        teacher: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        students: true,
      },
    });

    if (!cls) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json(cls, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/classes/:id]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/admin/classes/:id
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { name, section, year, teacherId } = body;

    const existing = await prisma.class.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    if (teacherId) {
      const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
      if (!teacher) {
        return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
      }
    }

    const updated = await prisma.class.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(section ? { section } : {}),
        ...(year ? { year: Number(year) } : {}),
        ...(teacherId ? { teacherId } : {}),
      },
      include: {
        teacher: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        students: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/admin/classes/:id]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/admin/classes/:id
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.class.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    await prisma.class.delete({ where: { id } });

    return NextResponse.json({ message: "Class deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/admin/classes/:id]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}