import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";

// POST /api/chat/send — Send a message on a ticket
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, content, senderId } = body;

    if (!ticketId || !content || !senderId) {
      return NextResponse.json(
        { error: "ticketId, content, and senderId are required" },
        { status: 400 }
      );
    }

    const message = await db.message.create({
      data: {
        ticketId,
        content,
        senderId,
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("[CHAT_SEND]", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
