import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";

// POST /api/petitions/vote — Vote on a petition
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { petitionId, userId } = body;

    if (!petitionId || !userId) {
      return NextResponse.json(
        { error: "petitionId and userId are required" },
        { status: 400 }
      );
    }

    const petition = await db.petition.findUnique({
      where: { id: parseInt(petitionId) },
    });

    if (!petition) {
      return NextResponse.json(
        { error: "Petition not found" },
        { status: 404 }
      );
    }

    const voterIds = (petition.voterIds as number[]) || [];
    const uid = parseInt(userId);

    if (voterIds.includes(uid)) {
      return NextResponse.json(
        { error: "You have already voted on this petition" },
        { status: 400 }
      );
    }

    const updated = await db.petition.update({
      where: { id: parseInt(petitionId) },
      data: {
        votes: { increment: 1 },
        voterIds: [...voterIds, uid],
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PETITION_VOTE]", error);
    return NextResponse.json(
      { error: "Failed to vote" },
      { status: 500 }
    );
  }
}
