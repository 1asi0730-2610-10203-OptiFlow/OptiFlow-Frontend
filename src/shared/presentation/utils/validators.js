const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email) {
  return EMAIL_REGEX.test(email)
}

export function isValidPhone(phone) {
  const cleaned = phone.replace(/[\s\-().]/g, '')
  return /^\+?\d{7,15}$/.test(cleaned)
}
