import { NextResponse } from "next/server";
import { db } from "@/db";
import { decisions } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

/**
 * Public REST API — Aggregate statistics for published decisions.
 * GET /api/v1/statistics
 */
export async function GET() {
  const byType = await db
    .select({
      decisionType: decisions.decisionType,
      count: sql<number>`count(*)::int`,
    })
    .from(decisions)
    .where(eq(decisions.isPublic, true))
    .groupBy(decisions.decisionType);

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(decisions)
    .where(eq(decisions.isPublic, true));

  return NextResponse.json({
    data: {
      totalPublished: totalResult?.count ?? 0,
      byType: Object.fromEntries(byType.map((r) => [r.decisionType, r.count])),
    },
  });
}
