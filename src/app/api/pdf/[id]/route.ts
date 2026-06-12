import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { renderToBuffer } from "@react-pdf/renderer"
import { BudgetPdfDocument } from "@/lib/pdf"
import React from "react"
import type { DocumentProps } from "@react-pdf/renderer"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const budget = await prisma.budget.findUnique({
    where: { id },
    include: { areas: true, products: { include: { product: true } }, extraItems: true },
  })
  if (!budget) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const buffer = await renderToBuffer(
    React.createElement(BudgetPdfDocument, { budget }) as React.ReactElement<DocumentProps>
  )

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="orcamento-${budget.clientName.replace(/\s+/g, "-")}.pdf"`,
    },
  })
}
