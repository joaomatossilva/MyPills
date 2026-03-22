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
  profileId: string
  profileName: string
  name: string
  boxSize: number
  dailyConsumption: number
  canEdit: boolean
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
  profileId: string
  profileName: string
  name: string
  boxSize: number
  dailyConsumption: number
  stockQuantity: number
  stockDate: string | null
  canEdit: boolean
  stockEntries: MedicineStockEntry[]
}

export interface PrescriptionListItem {
  id: string
  profileId: string
  profileName: string
  date: string
  expiryDate: string
  canEdit: boolean
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
  profileId: string
  profileName: string
  date: string
  expiryDate: string
  canEdit: boolean
  medicines: PrescriptionMedicineItem[]
}

export interface StockEntryListItem {
  id: string
  medicineId: string
  profileId: string
  profileName: string
  medicineName: string
  date: string
  quantity: number
  type: string
  canEdit: boolean
}

export interface StockEntriesResponse {
  stockEntries: StockEntryListItem[]
}

export interface StockEntryDetails {
  id: string
  medicineId: string
  profileId: string
  profileName: string
  medicineName: string
  date: string
  quantity: number
  type: string
  canEdit: boolean
}

export interface CreateStockEntryResponse {
  id: string
  medicineId: string
  profileId: string
  profileName: string
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

export interface OwnedProfileItem {
  id: string
  name: string
  isDefault: boolean
}

export interface OwnedProfilesResponse {
  profiles: OwnedProfileItem[]
}

export interface ProfileDetails {
  id: string
  name: string
  isDefault: boolean
  ownerUsername: string
}
