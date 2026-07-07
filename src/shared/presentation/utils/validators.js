const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email) {
  return EMAIL_REGEX.test(email)
}

export function isValidPhone(phone) {
  const trimmed = phone.trim()
  // Cap total length to match the backend column/StringLength(50); the digit count (7-15) is the real rule.
  if (trimmed.length > 50) return false
  const cleaned = trimmed.replace(/[\s\-().]/g, '')
  return /^\+?\d{7,15}$/.test(cleaned)
}

export function isValidDni(dni) {
  return /^[A-Za-z0-9]{8,12}$/.test(dni.trim())
}
