import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { analyzeComplaint } from "@/lib/ai/analyzer";

// POST /api/tickets — Create a new ticket with AI analysis
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, category, priority, userId } = body;

    // AI: Analyze the complaint before saving
    const aiAnalysis = await analyzeComplaint(description);

    const ticket = await db.ticket.create({
      data: {
        title,
        description,
        category: category || aiAnalysis.category, // Use AI suggestion if no category provided
        priority: priority || aiAnalysis.priority,  // Use AI suggestion if no priority provided
        userId,
        aiAnalysis,                                 // Store full AI response
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("[TICKETS_POST]", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}

// GET /api/tickets — List all tickets (newest first)
export async function GET() {
  try {
    const tickets = await db.ticket.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("[TICKETS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
