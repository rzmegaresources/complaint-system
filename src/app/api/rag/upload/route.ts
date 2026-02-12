import { NextResponse } from "next/server";
import { getEmbedding } from "@/lib/ai/gemini";
import { db } from "@/lib/db/prisma";

// POST /api/rag/upload — Add a document to the Knowledge Base
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, metadata } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required and must be a string" },
        { status: 400 }
      );
    }

    // Step 1: Generate embedding vector using Gemini
    const embedding = await getEmbedding(content);

    // Step 2: Store document with embedding in Supabase
    // Using raw SQL because Prisma doesn't support the vector type natively
    const vectorString = `[${embedding.join(",")}]`;

    await db.$executeRawUnsafe(
      `INSERT INTO documents (content, metadata, embedding, "createdAt")
       VALUES ($1, $2::jsonb, $3::vector, NOW())`,
      content,
      JSON.stringify(metadata || {}),
      vectorString
    );

    return NextResponse.json(
      { message: "Document uploaded and embedded successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[RAG_UPLOAD]", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
