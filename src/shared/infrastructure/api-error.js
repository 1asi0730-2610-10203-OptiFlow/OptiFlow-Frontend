/**
 * Extracts a human-readable message from an Axios error, digging the real reason out of the
 * backend response so the UI can show which field failed instead of a bare
 * "Request failed with status code 400".
 *
 * Handles ASP.NET shapes:
 *  - ValidationProblemDetails: { errors: { Field: ["msg", ...], ... }, title, status }
 *  - ProblemDetails:           { title, detail, status }
 *  - Plain string body (e.g. BadRequest("A patient with DNI ... already exists."))
 */
export function apiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data
  if (!data) return error?.message || fallback
  if (typeof data === 'string') return data
  if (data.errors && typeof data.errors === 'object') {
    const messages = Object.values(data.errors).flat().filter(Boolean)
    if (messages.length) return messages.join(' ')
  }
  return data.detail || data.title || data.message || error?.message || fallback
}
