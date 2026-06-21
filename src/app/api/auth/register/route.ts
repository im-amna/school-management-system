// Yeh API naya user register karti hai
// POST request bhejni hogi: name, email, password, role

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // Step 1: Validation — sab fields aaye hain ya nahi?
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 } // 400 = Bad Request
      );
    }

    // Step 2: Role valid hai? (sirf ADMIN, TEACHER, STUDENT allowed)
    if (!Object.values(Role).includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Step 3: Email already exist toh nahi karta?
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 } // 409 = Conflict
      );
    }

    // Step 4: Password ko hash (encrypt) karo
    // 10 = "salt rounds" - jitna zyada, utna secure (lekin slow bhi)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 5: Database mein user create karo
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    // Step 6: Password kabhi response mein wapas nahi bhejte!
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: "User created successfully", user: userWithoutPassword },
      { status: 201 } // 201 = Created
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 } // 500 = Server Error
    );
  }
}