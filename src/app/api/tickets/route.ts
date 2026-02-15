import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { analyzeComplaint } from "@/lib/ai/analyzer";

// POST /api/tickets — Create a new ticket with AI analysis
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, category, priority, userId, location, imageUrl, latitude, longitude } = body;

    // AI: Analyze the complaint before saving
    const aiAnalysis = await analyzeComplaint(description);

    const ticket = await db.ticket.create({
      data: {
        title,
        description,
        category: category || aiAnalysis.category, // Use AI suggestion if no category provided
        priority: priority || aiAnalysis.priority,  // Use AI suggestion if no priority provided
        location: location || undefined,
        imageUrl: imageUrl || undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        userId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        aiAnalysis: JSON.parse(JSON.stringify(aiAnalysis)) as any,
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("[TICKETS_POST]", error);
    const message = error instanceof Error ? error.message : "Failed to create ticket";
    return NextResponse.json(
      { error: message },
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

// PATCH /api/tickets — Update ticket status and send email if resolved
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, resolutionNote } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID and Status are required" },
        { status: 400 }
      );
    }

    const ticket = await db.ticket.update({
      where: { id },
      data: { 
        status,
        // If we had a resolutionNote field in schema, we'd save it here.
        // For now, we just use it for the email.
      },
      include: {
        user: true, // Need user email to send notification
      },
    });

    // Send email if Resolved
    if (status === "RESOLVED" && ticket.user?.email) {
      const { sendEmail } = await import("@/lib/mail/mailer");
      await sendEmail(
        ticket.user.email,
        `Ticket #${ticket.id} Resolved`,
        `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Your ticket has been resolved.</h2>
            <p><strong>Ticket:</strong> ${ticket.title}</p>
            <p><strong>Status:</strong> <span style="color: green;">RESOLVED</span></p>
            ${
              resolutionNote
                ? `<p><strong>Resolution Note:</strong><br/>${resolutionNote}</p>`
                : ""
            }
            <hr/>
            <p>Thank you for using VoiceBox.</p>
          </div>
        `
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("[TICKETS_PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}
