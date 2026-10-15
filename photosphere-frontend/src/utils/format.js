/**
 * utils/format.js — Formatadores de exibição (Aula 10).
 */

const compactFormatter = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })
const relativeFormatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

/**
 * 950 → "950", 1200 → "1,2 mil", 3400000 → "3,4 mi"
 */
export function formatCount(value) {
  const n = Number(value) || 0
  return n < 1000 ? String(n) : compactFormatter.format(n)
}

/**
 * Plural simples: pluralize(1, 'curtida') → "1 curtida"; pluralize(3, 'curtida') → "3 curtidas"
 */
export function pluralize(count, singular, plural = `${singular}s`) {
  const n = Number(count) || 0
  return `${formatCount(n)} ${n === 1 ? singular : plural}`
}

/**
 * Data relativa: "agora mesmo", "há 5 minutos", "ontem", "há 3 semanas"...
 */
export function formatRelativeTime(date) {
  const then = new Date(date).getTime()
  if (Number.isNaN(then)) return ''

  const seconds = Math.round((then - Date.now()) / 1000)
  const abs = Math.abs(seconds)
  if (abs < 45) return 'agora mesmo'

  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, size] of units) {
    if (abs >= size) return relativeFormatter.format(Math.round(seconds / size), unit)
  }
  return relativeFormatter.format(Math.round(seconds / 60), 'minute')
}

/**
 * Data completa para o atributo title (tooltip): "15/10/2026 19:42"
 */
export function formatDateTime(date) {
  return new Date(date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}
