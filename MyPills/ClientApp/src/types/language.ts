import type { ReactNode } from 'react'

export type AppLanguage = 'en' | 'pt'

export interface LanguageProviderProps {
  children: ReactNode
}

export interface TranslationDictionary {
  languageName: string
  layout: {
    home: string
    medicines: string
    stock: string
    prescriptions: string
    login: string
    logout: string
    loading: string
    welcome: (username: string | null) => string
    languageLabel: string
    footer: string
    skipToContent: string
    skipToNavigation: string
  }
  common: {
    loading: string
    loadingForm: string
    redirecting: string
    create: string
    save: string
    delete: string
    submit: string
    add: string
    edit: string
    cancel: string
    backToList: string
    backToDetails: string
    backToOverview: string
    requestFailed: string
    notFound: string
  }
  splash: {
    signIn: string
    getStarted: string
    titleStart: string
    titleAccent: string
    lead: string
    liveInventory: string
    inventoryAspirin: string
    inventoryVitaminD: string
    expiringSoon: string
    stockTracking: string
    stockTrackingDescription: string
    prescriptionVault: string
    prescriptionVaultDescription: string
    smartAlerts: string
    smartAlertsDescription: string
    footer: string
  }
  home: {
    title: string
    subtitle: string
    loggedIn: (username: string | null) => string
    loggedInHint: string
    notLoggedIn: string
    notLoggedInHint: string
    aboutTitle: string
    aboutDescription: string
  }
  test: {
    title: string
    successTitle: string
    authenticatedAs: (username: string | null) => string
    protectedContent: string
    protectedDescription: string
    technicalDetails: string
    details: string[]
  }
  overview: {
    title: string
    remainingPills: string
    estimatedFinish: string
    prescriptions: string
    addStock: string
    loading: string
    error: string
  }
  medicines: {
    title: string
    add: string
    empty: string
    loadingList: string
    loadingDetails: string
    loadingDelete: string
    editTitle: string
    createTitle: string
    detailsTitle: string
    deleteTitle: string
    deletePrompt: string
    entityLabel: string
    latestStocks: string
    addStockEntry: string
    name: string
    boxSize: string
    stockQuantity: string
    stockDate: string
    date: string
    quantity: string
    type: string
    notFound: string
    failedList: string
    failedDetails: string
    failedCreate: string
    failedUpdate: string
    failedDelete: string
    validation: {
      nameRequired: string
      boxSizePositive: string
    }
  }
  prescriptions: {
    title: string
    add: string
    empty: string
    loadingList: string
    loadingDetails: string
    loadingDelete: string
    loadingMedicine: string
    createTitle: string
    editTitle: string
    detailsTitle: string
    deleteTitle: string
    deletePrompt: string
    entityLabel: string
    medicinesSection: string
    addMedicine: string
    medicine: string
    date: string
    expiryDate: string
    quantity: string
    consumedQuantity: string
    notFound: string
    medicineNotFound: string
    noMedicines: string
    failedList: string
    failedDetails: string
    failedCreate: string
    failedUpdate: string
    failedDelete: string
    failedLoadMedicine: string
    failedAddMedicine: string
    failedUpdateMedicine: string
    failedDeleteMedicine: string
    deleteMedicinePrompt: string
    editMedicineTitle: string
    addMedicineTitle: string
    deleteMedicineTitle: string
    deleteMedicineEntityLabel: string
    validation: {
      dateRequired: string
      expiryDateRequired: string
      expiryDateBeforeDate: string
      medicineRequired: string
      quantityPositive: string
      consumedNonNegative: string
      consumedExceedsQuantity: string
    }
  }
  stock: {
    title: string
    add: string
    empty: string
    loadingList: string
    loadingDetails: string
    loadingDeductions: string
    createTitle: string
    detailsTitle: string
    deductionsTitle: string
    notFound: string
    medicine: string
    date: string
    quantity: string
    type: string
    box: string
    increase: string
    decrease: string
    set: string
    failedList: string
    failedDetails: string
    failedCreate: string
    failedLoadForm: string
    failedLoadDeductions: string
    failedApplyDeductions: string
    noMedicineAndBoxes: string
    availableSuffix: string
    validation: {
      medicineRequired: string
      quantityPositive: string
      typeRequired: string
      deductionQuantityNonNegative: string
    }
  }
}

export interface LanguageContextValue {
  language: AppLanguage
  locale: string
  setLanguage: (language: AppLanguage) => void
  text: TranslationDictionary
  availableLanguages: Array<{ code: AppLanguage; label: string }>
}

