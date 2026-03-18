export function formatDateOnly(value) {
  if (!value) {
    return 'N/A'
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString()
}

export function formatDateTime(value) {
  if (!value) {
    return 'N/A'
  }

  return new Date(value).toLocaleDateString()
}

