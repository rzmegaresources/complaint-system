import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";

// GET /api/rag/documents — List all knowledge base documents
export async function GET() {
  try {
    const documents = await db.document.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        metadata: true,
        createdAt: true,
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("[RAG_DOCUMENTS]", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
