const BASE_URL = 'https://pokeapi.co/api/v2'

export class PokeApiError extends Error {
  constructor(message, { status, cause } = {}) {
    super(message)
    this.name = 'PokeApiError'
    this.status = status
    if (cause) this.cause = cause
  }
}

const cache = new Map()

async function fetchJson(url) {
  let response
  try {
    response = await fetch(url)
  } catch (error) {
    throw new PokeApiError(`No se pudo conectar con PokéAPI: ${url}`, { cause: error })
  }

  if (!response.ok) {
    throw new PokeApiError(`PokéAPI respondió ${response.status} para ${url}`, { status: response.status })
  }

  return response.json()
}

// Cachea la promesa (no solo el resultado) para deduplicar peticiones concurrentes
// al mismo recurso. Si falla, se elimina del cache para no atascar errores transitorios.
export function apiGet(path) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`

  if (!cache.has(url)) {
    const promise = fetchJson(url).catch((error) => {
      cache.delete(url)
      throw error
    })
    cache.set(url, promise)
  }

  return cache.get(url)
}
