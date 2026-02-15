import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";

// GET /api/admin/analytics — Dashboard analytics data
export async function GET() {
  try {
    // Total counts
    const totalTickets = await db.ticket.count();
    const openTickets = await db.ticket.count({ where: { status: "OPEN" } });
    const resolvedTickets = await db.ticket.count({ where: { status: "RESOLVED" } });
    const criticalTickets = await db.ticket.count({ where: { priority: "CRITICAL" } });

    // Group by priority
    const byPriority = await db.ticket.groupBy({
      by: ["priority"],
      _count: { priority: true },
      orderBy: { _count: { priority: "desc" } },
    });

    // Group by status
    const byStatus = await db.ticket.groupBy({
      by: ["status"],
      _count: { status: true },
      orderBy: { _count: { status: "desc" } },
    });

    // Group by category (non-null only)
    const byCategory = await db.ticket.groupBy({
      by: ["category"],
      _count: { category: true },
      where: { category: { not: null } },
      orderBy: { _count: { category: "desc" } },
      take: 8,
    });

    return NextResponse.json({
      totalTickets,
      openTickets,
      resolvedTickets,
      criticalTickets,
      byPriority: byPriority.map((p) => ({
        priority: p.priority,
        count: p._count.priority,
      })),
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
      byCategory: byCategory.map((c) => ({
        category: c.category,
        count: c._count.category,
      })),
    });
  } catch (error) {
    console.error("[ADMIN_ANALYTICS]", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
