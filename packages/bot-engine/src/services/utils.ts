export const sanitizeUrl = (url: string): string =>
  url.startsWith('http') ||
  url.startsWith('mailto:') ||
  url.startsWith('tel:') ||
  url.startsWith('sms:')
    ? url
    : `https://${url}`
