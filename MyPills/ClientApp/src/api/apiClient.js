export async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  })

  if (response.status === 401) {
    window.location.href = '/Identity/Account/Login'
    return { response, data: null }
  }

  const contentType = response.headers.get('content-type') ?? ''
  const data = contentType.includes('application/json') ? await response.json() : null

  return { response, data }
}

export function formatValidationError(data) {
  if (!data || typeof data !== 'object') {
    return 'Request failed.'
  }

  if (data.title) {
    return data.title
  }

  if (data.errors) {
    const messages = Object.values(data.errors)
      .flat()
      .filter(Boolean)

    if (messages.length > 0) {
      return messages.join(' ')
    }
  }

  return 'Request failed.'
}

