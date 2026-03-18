export function formatDateOnly(value: string | null | undefined, locale = 'en-US'): string {
  if (!value) {
    return 'N/A'
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString(locale)
}

export function formatDateTime(value: string | null | undefined, locale = 'en-US'): string {
  if (!value) {
    return 'N/A'
  }

  return new Date(value).toLocaleDateString(locale)
}

