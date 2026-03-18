import type { TranslationDictionary } from '../types/language'

export function getStockEntryTypeLabel(type: string, stockText: TranslationDictionary['stock']) {
  switch (type) {
    case 'Box':
      return stockText.box
    case 'Manual':
    case 'Increase':
      return stockText.increase
    case 'Decrease':
      return stockText.decrease
    case 'Set':
      return stockText.set
    default:
      return type
  }
}
