// src/app/api/admin/fees/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// PUT — mark as paid / update
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { status, amount, description, dueDate } = body;

    const existing = await prisma.fee.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Fee not found" }, { status: 404 });
    }

    const updated = await prisma.fee.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(status === "PAID" ? { paidAt: new Date() } : {}),
        ...(amount ? { amount: Number(amount) } : {}),
        ...(description ? { description } : {}),
        ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/admin/fees/:id]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.fee.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Fee not found" }, { status: 404 });
    }

    await prisma.fee.delete({ where: { id } });
    return NextResponse.json({ message: "Fee deleted" }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/admin/fees/:id]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}