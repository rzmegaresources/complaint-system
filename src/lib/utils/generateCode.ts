import { db } from "@/lib/db/prisma";

/**
 * Generate a unique ticket code with a prefix and random 5-digit number.
 * Format: C00001-C99999 (Complaints), F00001-F99999 (Feedback), P00001-P99999 (Petitions)
 * 
 * @param prefix - "C" for complaints, "F" for feedback, "P" for petitions
 * @param model  - Prisma model name to check uniqueness against
 * @param field  - Field name to check uniqueness (e.g. "ticketCode", "feedbackCode")
 */
export async function generateTicketCode(
  prefix: "C" | "F" | "P",
  model: "ticket" | "feedback" | "petition",
  field: "ticketCode" | "feedbackCode" | "petitionCode"
): Promise<string> {
  const maxAttempts = 10;

  for (let i = 0; i < maxAttempts; i++) {
    // Generate random number between 1 and 99999
    const num = Math.floor(Math.random() * 99999) + 1;
    const code = `${prefix}${num.toString().padStart(5, "0")}`;

    // Check uniqueness
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (db[model] as any).findUnique({
      where: { [field]: code },
    });

    if (!existing) return code;
  }

  // Fallback: use timestamp-based code if random fails after max attempts
  const ts = Date.now().toString().slice(-5);
  return `${prefix}${ts}`;
}
