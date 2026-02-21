import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { generateTicketCode } from "@/lib/utils/generateCode";

// POST /api/feedback — Create new feedback
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, target, rating, comment, userId } = body;

    if (!type || !comment || !userId) {
      return NextResponse.json(
        { error: "type, comment, and userId are required" },
        { status: 400 }
      );
    }

    const feedbackCode = await generateTicketCode("F", "feedback", "feedbackCode");

    const feedback = await db.feedback.create({
      data: {
        feedbackCode,
        type,
        target: target || null,
        rating: rating ? parseInt(rating) : null,
        comment,
        userId: parseInt(userId),
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("[FEEDBACK_CREATE]", error);
    return NextResponse.json(
      { error: "Failed to create feedback" },
      { status: 500 }
    );
  }
}

// GET /api/feedback?userId=X — List user's feedback
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const where = userId ? { userId: parseInt(userId) } : {};

    const feedbacks = await db.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("[FEEDBACK_LIST]", error);
    return NextResponse.json(
      { error: "Failed to fetch feedbacks" },
      { status: 500 }
    );
  }
}
