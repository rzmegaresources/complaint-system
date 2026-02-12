import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client for vector search RPC calls
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DocumentMatch {
  id: number;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

/**
 * Search the Document table for the most relevant knowledge snippets
 * using pgvector cosine similarity.
 *
 * @param embedding   - The 768-dimension vector from getEmbedding()
 * @param matchThreshold - Minimum similarity score (0 to 1). Default: 0.7
 * @param matchCount     - Max number of results to return. Default: 5
 * @returns Array of matching documents sorted by similarity (highest first)
 */
export async function matchDocuments(
  embedding: number[],
  matchThreshold: number = 0.7,
  matchCount: number = 5
): Promise<DocumentMatch[]> {
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  if (error) {
    console.error("[VECTOR_SEARCH]", error);
    return [];
  }

  return data as DocumentMatch[];
}
