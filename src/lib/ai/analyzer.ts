import { geminiModel } from "@/lib/ai/gemini";

interface ComplaintAnalysis {
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sentiment: "ANGRY" | "NEUTRAL" | "CALM";
}

/**
 * Analyze a complaint description using Gemini AI.
 * Returns structured JSON with category, priority, and sentiment.
 * This result is stored in the Ticket model's `aiAnalysis` field.
 */
export async function analyzeComplaint(
  description: string
): Promise<ComplaintAnalysis> {
  const prompt = `
You are an AI complaint analyst for a complaint management system.
Analyze the following complaint and return ONLY valid JSON with these exact fields:

- "category": A short label (e.g., "IT", "Maintenance", "HR", "Finance", "Security", "Facilities", "Other")
- "priority": One of "LOW", "MEDIUM", "HIGH", "CRITICAL"
- "sentiment": One of "ANGRY", "NEUTRAL", "CALM"

Rules for priority:
- CRITICAL: Safety hazards, security breaches, service outages
- HIGH: Significant disruptions, repeated issues, urgent requests
- MEDIUM: Standard complaints, moderate impact
- LOW: Minor inconveniences, suggestions, general feedback

Complaint:
"""
${description}
"""

Respond with ONLY the JSON object. No markdown, no explanation.
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Strip any markdown code fences Gemini might add
    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const analysis: ComplaintAnalysis = JSON.parse(cleaned);

    return analysis;
  } catch (error) {
    console.error("[AI_ANALYZER]", error);

    // Fallback: return safe defaults if AI fails
    return {
      category: "Other",
      priority: "MEDIUM",
      sentiment: "NEUTRAL",
    };
  }
}
