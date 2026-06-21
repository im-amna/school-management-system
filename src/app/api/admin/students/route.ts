// src/app/api/admin/students/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/admin/students — Fetch all students
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const students = await prisma.student.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        class: true,
      },
    });

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/students]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/admin/students — Create a new student + linked user account
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email, password, rollNumber, classId } = body;

    if (!name || !email || !password || !rollNumber) {
      return NextResponse.json(
        { error: "name, email, password, and rollNumber are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const existingRoll = await prisma.student.findUnique({ where: { rollNumber } });
    if (existingRoll) {
      return NextResponse.json({ error: "Roll number already in use" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "STUDENT",
        },
      });

      const student = await tx.student.create({
        data: {
          rollNumber,
          userId: user.id,
          ...(classId ? { classId } : {}),
        },
        include: {
          user: {
            select: { id: true, email: true, name: true, role: true },
          },
          class: true,
        },
      });

      return student;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/students]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}