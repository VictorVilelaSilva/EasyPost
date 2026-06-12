import type { AreaInput } from "@/types"

export function calcPaintableArea(area: AreaInput): number {
  if (area.mode === "known") {
    return area.knownArea ?? 0
  }
  const gross = (area.wallHeight ?? 0) * (area.wallWidth ?? 0)
  const doorsArea = (area.doorsCount ?? 0) * (area.doorHeight ?? 0) * (area.doorWidth ?? 0)
  const windowsArea = (area.windowsCount ?? 0) * (area.windowHeight ?? 0) * (area.windowWidth ?? 0)
  return Math.max(0, gross - doorsArea - windowsArea)
}

export function calcAreaForPaint(paintableArea: number, coats: number): number {
  return paintableArea * Math.max(1, coats)
}

export function calcPackages(areaForPaint: number, yieldM2: number): number {
  if (yieldM2 <= 0 || areaForPaint <= 0) return 0
  return Math.ceil(areaForPaint / yieldM2)
}

export function calcTotals(
  products: { quantity: number; unitPrice: number }[],
  extraItems: { quantity: number; unitPrice: number }[],
  laborValue: number
): { totalMaterials: number; totalValue: number } {
  const productSubtotal = products.reduce((s, p) => s + p.quantity * p.unitPrice, 0)
  const extraSubtotal = extraItems.reduce((s, e) => s + e.quantity * e.unitPrice, 0)
  const totalMaterials = productSubtotal + extraSubtotal
  return { totalMaterials, totalValue: totalMaterials + laborValue }
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function parseDecimal(value: string): number {
  return parseFloat(value.replace(",", ".")) || 0
}
