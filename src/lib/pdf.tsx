import {
  Document, Page, Text, View, StyleSheet,
} from "@react-pdf/renderer"
import { formatCurrency } from "@/lib/calculations"

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 4, textAlign: "center" },
  subtitle: { fontSize: 10, color: "#64748b", textAlign: "center", marginBottom: 20 },
  section: { marginBottom: 16, padding: 12, border: "1pt solid #e2e8f0", borderRadius: 6 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  bold: { fontWeight: "bold" },
  total: { backgroundColor: "#2563eb", color: "white", padding: 12, borderRadius: 6, flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontSize: 12, fontWeight: "bold", color: "white" },
  totalValue: { fontSize: 16, fontWeight: "bold", color: "white" },
  note: { fontSize: 8, color: "#64748b", textAlign: "center", marginTop: 12 },
})

interface BudgetForPdf {
  clientName: string
  clientPhone?: string | null
  clientAddress?: string | null
  clientNotes?: string | null
  createdAt: Date
  areas: { name: string; coats: number; areaForPaint: number }[]
  products: { product: { name: string; packageLabel: string }; quantity: number; subtotal: number }[]
  extraItems: { name: string; quantity: number; subtotal: number }[]
  totalMaterials: number
  laborValue: number
  laborDeadline?: string | null
  paymentMethod?: string | null
  totalValue: number
}

export function BudgetPdfDocument({ budget }: { budget: BudgetForPdf }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Orçamento de Pintura</Text>
        <Text style={styles.subtitle}>{new Date(budget.createdAt).toLocaleDateString("pt-BR")}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{budget.clientName}</Text>
          {budget.clientPhone && <Text>{budget.clientPhone}</Text>}
          {budget.clientAddress && <Text>{budget.clientAddress}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Áreas de pintura</Text>
          {budget.areas.map((a, i) => (
            <View key={i} style={styles.row}>
              <Text>{a.name} ({a.coats} demãos)</Text>
              <Text>{a.areaForPaint.toFixed(1)} m²</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materiais</Text>
          {budget.products.map((p, i) => (
            <View key={i} style={styles.row}>
              <Text>{p.product.name} × {p.quantity} {p.product.packageLabel}</Text>
              <Text>{formatCurrency(p.subtotal)}</Text>
            </View>
          ))}
          {budget.extraItems.map((e, i) => (
            <View key={i} style={styles.row}>
              <Text>{e.name} × {e.quantity}</Text>
              <Text>{formatCurrency(e.subtotal)}</Text>
            </View>
          ))}
          <View style={[styles.row, { borderTopWidth: 1, borderTopColor: "#e2e8f0", marginTop: 4, paddingTop: 4 }]}>
            <Text style={styles.bold}>Subtotal materiais</Text>
            <Text style={styles.bold}>{formatCurrency(budget.totalMaterials)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text>Mão de obra</Text>
            <Text>{formatCurrency(budget.laborValue)}</Text>
          </View>
          {budget.laborDeadline && <Text>Prazo: {budget.laborDeadline}</Text>}
          {budget.paymentMethod && <Text>Pagamento: {budget.paymentMethod}</Text>}
        </View>

        <View style={styles.total}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>{formatCurrency(budget.totalValue)}</Text>
        </View>

        <Text style={styles.note}>
          * Este orçamento é uma estimativa. Valores podem variar conforme condições da obra.
        </Text>
      </Page>
    </Document>
  )
}
