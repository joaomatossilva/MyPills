export interface ValidationErrorResponse {
  title?: string
  errors?: Record<string, string[]>
}

export interface RequestJsonResult<T> {
  response: Response
  data: T | null
}

export interface OverviewMedicine {
  medicineId: string
  name: string
  dailyConsumption: number
  availableQuantity: number
  boxesInPrescription: number
  estimatedDate: string
}

export interface OverviewResponse {
  medicines: OverviewMedicine[]
}

export interface MedicineListItem {
  id: string
  name: string
  boxSize: number
  dailyConsumption: number
}

export interface MedicinesResponse {
  medicines: MedicineListItem[]
}

export interface MedicineStockEntry {
  id: string
  date: string
  quantity: number
  type: string
}

export interface MedicineDetails {
  id: string
  name: string
  boxSize: number
  dailyConsumption: number
  stockQuantity: number
  stockDate: string | null
  stockEntries: MedicineStockEntry[]
}

export interface PrescriptionListItem {
  id: string
  date: string
  expiryDate: string
}

export interface PrescriptionsResponse {
  prescriptions: PrescriptionListItem[]
}

export interface PrescriptionMedicineItem {
  medicineId: string
  medicineName: string
  boxSize: number
  quantity: number
  consumedQuantity: number
}

export interface PrescriptionDetails {
  id: string
  date: string
  expiryDate: string
  medicines: PrescriptionMedicineItem[]
}

export interface StockEntryListItem {
  id: string
  medicineId: string
  medicineName: string
  date: string
  quantity: number
  type: string
}

export interface StockEntriesResponse {
  stockEntries: StockEntryListItem[]
}

export interface StockEntryDetails {
  id: string
  medicineId: string
  medicineName: string
  date: string
  quantity: number
  type: string
}

export interface CreateStockEntryResponse {
  id: string
  medicineId: string
  date: string
  quantity: number
  type: string
  requiresPrescriptionDeduction: boolean
  deductionBoxes: number
}

export interface StockDeductionPrescriptionItem {
  prescriptionId: string
  date: string
  available: number
  quantity: number
}

export interface StockDeductionPreviewResponse {
  medicineId: string
  boxes: number
  prescriptions: StockDeductionPrescriptionItem[]
}
