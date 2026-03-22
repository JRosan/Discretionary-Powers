import { NextRequest, NextResponse } from "next/server";
import {
  getDecisionExportData,
  exportAsJson,
  exportAsCsv,
  exportAsHtml,
} from "@/modules/reporting/export.service";

/**
 * Export a decision in various formats.
 * GET /api/v1/decisions/:id/export?format=json|csv|html
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const format = request.nextUrl.searchParams.get("format") ?? "json";

  const data = await getDecisionExportData(id);

  if (!data) {
    return NextResponse.json(
      { error: "Decision not found." },
      { status: 404 }
    );
  }

  switch (format) {
    case "csv": {
      const csv = exportAsCsv(data);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${data.decision.referenceNumber}.csv"`,
        },
      });
    }

    case "html": {
      const html = exportAsHtml(data);
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `attachment; filename="${data.decision.referenceNumber}.html"`,
        },
      });
    }

    case "json":
    default: {
      const json = exportAsJson(data);
      return new NextResponse(json, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${data.decision.referenceNumber}.json"`,
        },
      });
    }
  }
}
