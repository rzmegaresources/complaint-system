import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { generateTicketCode } from "@/lib/utils/generateCode";

// POST /api/petitions — Create a new petition
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, category, userId } = body;

    if (!title || !description || !userId) {
      return NextResponse.json(
        { error: "title, description, and userId are required" },
        { status: 400 }
      );
    }

    const petitionCode = await generateTicketCode("P", "petition", "petitionCode");

    const petition = await db.petition.create({
      data: {
        petitionCode,
        title,
        description,
        category: category || null,
        userId: parseInt(userId),
        voterIds: [parseInt(userId)],
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(petition, { status: 201 });
  } catch (error) {
    console.error("[PETITION_CREATE]", error);
    return NextResponse.json(
      { error: "Failed to create petition" },
      { status: 500 }
    );
  }
}

// GET /api/petitions — List all active petitions
export async function GET() {
  try {
    const petitions = await db.petition.findMany({
      orderBy: { votes: "desc" },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(petitions);
  } catch (error) {
    console.error("[PETITION_LIST]", error);
    return NextResponse.json(
      { error: "Failed to fetch petitions" },
      { status: 500 }
    );
  }
}
