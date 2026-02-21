import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";

// GET /api/user/history?userId=X — Get all user's complaints, feedback, and petitions
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const uid = parseInt(userId);

    const [tickets, feedbacks, petitions] = await Promise.all([
      db.ticket.findMany({
        where: { userId: uid },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          ticketCode: true,
          title: true,
          status: true,
          priority: true,
          category: true,
          createdAt: true,
        },
      }),
      db.feedback.findMany({
        where: { userId: uid },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          feedbackCode: true,
          type: true,
          target: true,
          rating: true,
          comment: true,
          createdAt: true,
        },
      }),
      db.petition.findMany({
        where: { userId: uid },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          petitionCode: true,
          title: true,
          description: true,
          votes: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({ tickets, feedbacks, petitions });
  } catch (error) {
    console.error("[USER_HISTORY]", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
