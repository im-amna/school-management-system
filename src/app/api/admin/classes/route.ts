// src/app/api/admin/classes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/classes — Fetch all classes
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const classes = await prisma.class.findMany({
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

    return NextResponse.json(classes, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/classes]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/admin/classes — Create a new class
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, section, year, teacherId } = body;

    if (!name || !section || !year || !teacherId) {
      return NextResponse.json(
        { error: "name, section, year, and teacherId are required" },
        { status: 400 }
      );
    }

    // Check teacher exists
    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        section,
        year: Number(year),
        teacherId,
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

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/classes]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}