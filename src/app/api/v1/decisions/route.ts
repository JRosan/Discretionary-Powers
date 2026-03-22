import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { decisions } from "@/db/schema";
import { eq, desc, and, ilike } from "drizzle-orm";

/**
 * Public REST API — List published decisions.
 * GET /api/v1/decisions?search=&type=&ministry=&limit=20&offset=0
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search");
  const type = searchParams.get("type");
  const ministryId = searchParams.get("ministry");
  const limit = Math.min(Number(searchParams.get("limit") || 20), 100);
  const offset = Number(searchParams.get("offset") || 0);

  const conditions = [eq(decisions.isPublic, true)];

  if (search) {
    conditions.push(ilike(decisions.title, `%${search}%`));
  }
  if (type) {
    conditions.push(eq(decisions.decisionType, type as typeof decisions.decisionType.enumValues[number]));
  }
  if (ministryId) {
    conditions.push(eq(decisions.ministryId, ministryId));
  }

  const items = await db
    .select()
    .from(decisions)
    .where(and(...conditions))
    .orderBy(desc(decisions.updatedAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({
    data: items,
    pagination: { limit, offset, count: items.length },
  });
}
