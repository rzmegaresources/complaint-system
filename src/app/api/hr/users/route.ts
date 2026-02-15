import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";

// GET /api/hr/users — List all users with ticket counts (HR access)
export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        loginId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { tickets: true },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[HR_USERS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/hr/users — Create a new user
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, role, loginId, password } = body;

    if (!name || !email || !loginId || !password) {
      return NextResponse.json(
        { error: "Name, email, login ID, and password are required" },
        { status: 400 }
      );
    }

    // Check if loginId already exists
    const existingLoginId = await db.user.findFirst({
      where: { loginId: { equals: loginId.toUpperCase(), mode: "insensitive" } },
    });
    if (existingLoginId) {
      return NextResponse.json(
        { error: `Login ID "${loginId}" is already taken` },
        { status: 409 }
      );
    }

    // Check if email already exists
    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const user = await db.user.create({
      data: {
        loginId: loginId.toUpperCase(),
        password,
        name,
        email,
        role: role || "USER",
      },
      select: {
        id: true,
        loginId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { tickets: true },
        },
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("[HR_USERS_POST]", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
