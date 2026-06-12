import { NextRequest, NextResponse } from "next/server"
import { getPublicBudgetById } from "@/lib/budget"
import { renderToBuffer } from "@react-pdf/renderer"
import { BudgetPdfDocument } from "@/lib/pdf"
import React from "react"
import type { DocumentProps } from "@react-pdf/renderer"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const budget = await getPublicBudgetById(id)
  if (!budget) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const safeName = budget.clientName
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60)

  const buffer = await renderToBuffer(
    React.createElement(BudgetPdfDocument, { budget }) as unknown as React.ReactElement<DocumentProps>
  )

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="orcamento-${safeName}.pdf"`,
    },
  })
}
