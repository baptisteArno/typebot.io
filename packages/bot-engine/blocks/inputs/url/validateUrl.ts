export const validateUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch (_) {
    return false
  }
}
