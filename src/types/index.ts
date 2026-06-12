export type BudgetStatus = "DRAFT" | "SENT" | "APPROVED" | "REJECTED"
export type UserRole = "PAINTER" | "ADMIN"

export interface AreaInput {
  name: string
  mode: "known" | "calculate"
  // modo "known"
  knownArea?: number
  coats: number
  // modo "calculate"
  wallHeight?: number
  wallWidth?: number
  doorsCount?: number
  doorHeight?: number
  doorWidth?: number
  windowsCount?: number
  windowHeight?: number
  windowWidth?: number
}

export interface WizardProduct {
  productId: string
  name: string
  packageLabel: string
  yieldM2: number
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface WizardExtraItem {
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface WizardState {
  clientName: string
  clientPhone: string
  clientAddress: string
  clientNotes: string
  areas: AreaInput[]
  products: WizardProduct[]
  extraItems: WizardExtraItem[]
  laborValue: number
  laborDeadline: string
  paymentMethod: string
  laborNotes: string
  totalMaterials: number
  totalValue: number
}
