import { NextResponse } from "next/server";
import { getSolutionSuggestion } from "@/lib/ai/rag";

// POST /api/rag/suggest — Get AI solution suggestion for a ticket
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description } = body;

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const suggestion = await getSolutionSuggestion(description);

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("[RAG_SUGGEST]", error);
    return NextResponse.json(
      { error: "Failed to get AI suggestion" },
      { status: 500 }
    );
  }
}
