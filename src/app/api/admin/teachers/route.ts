// src/app/api/admin/teachers/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/admin/teachers — Fetch all teachers
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true, role: true },
        },
        classes: true,
      },
    });

    return NextResponse.json(teachers, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/teachers]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/admin/teachers — Create a new teacher + linked user account
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email, password, subject } = body;

    if (!name || !email || !password || !subject) {
      return NextResponse.json(
        { error: "name, email, password, and subject are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "TEACHER",
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          subject,
          userId: user.id,
        },
        include: {
          user: {
            select: { id: true, email: true, name: true, role: true },
          },
          classes: true,
        },
      });

      return teacher;
    }, { timeout: 30000 });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/teachers]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}