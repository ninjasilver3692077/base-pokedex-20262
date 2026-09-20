export function getIdFromUrl(url) {
  const match = url.match(/\/(\d+)\/?$/)
  return match ? Number(match[1]) : null
}
