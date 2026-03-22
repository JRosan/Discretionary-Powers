import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { decisions, decisionSteps } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Public REST API — Get a single published decision.
 * GET /api/v1/decisions/:id
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [decision] = await db
    .select()
    .from(decisions)
    .where(and(eq(decisions.id, id), eq(decisions.isPublic, true)))
    .limit(1);

  if (!decision) {
    return NextResponse.json(
      { error: "Decision not found or not published." },
      { status: 404 }
    );
  }

  const steps = await db
    .select({
      stepNumber: decisionSteps.stepNumber,
      status: decisionSteps.status,
      completedAt: decisionSteps.completedAt,
    })
    .from(decisionSteps)
    .where(eq(decisionSteps.decisionId, id))
    .orderBy(decisionSteps.stepNumber);

  return NextResponse.json({ data: { ...decision, steps } });
}
