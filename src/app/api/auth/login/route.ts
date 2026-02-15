import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";

// POST /api/auth/login — Authenticate user by loginId + password
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { loginId, password } = body;

    if (!loginId || !password) {
      return NextResponse.json(
        { error: "Login ID and password are required" },
        { status: 400 }
      );
    }

    // Find user by loginId (case-insensitive)
    const user = await db.user.findFirst({
      where: {
        loginId: {
          equals: loginId.trim().toUpperCase(),
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        loginId: true,
        name: true,
        email: true,
        role: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid login ID" },
        { status: 401 }
      );
    }

    // Check password (plain text comparison for demo)
    if (user.password !== password) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Return user info (excluding password)
    // Return user info (excluding password)
    const { password: _password, ...safeUser } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error("[AUTH_LOGIN]", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
