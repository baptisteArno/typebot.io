/**
 * Helper function to check if an origin matches a pattern (supporting wildcards)
 * @param origin - The origin to check (e.g., "https://myapp.app.cloudhumans.com")
 * @param pattern - The pattern to match against (e.g., "https://*.app.cloudhumans.com")
 * @returns true if the origin matches the pattern
 */
export const matchesOriginPattern = (origin: string, pattern: string): boolean => {
  // Handle wildcard patterns like "https://*.app.cloudhumans.com"
  if (pattern.includes('://*.')) {
    try {
      // Extract the domain from the pattern: "https://*.app.cloudhumans.com" -> "app.cloudhumans.com"
      const patternUrl = new URL(pattern.replace('*.', 'dummy.'))
      const domain = patternUrl.hostname.replace('dummy.', '')
      
      // Extract hostname from origin
      const originUrl = new URL(origin)
      const hostname = originUrl.hostname
      
      // Check exact match first
      if (hostname === domain) return true
      
      // For wildcard, ensure it's a direct subdomain (only one additional level)
      if (hostname.endsWith('.' + domain)) {
        const prefix = hostname.replace('.' + domain, '')
        // Ensure the prefix doesn't contain dots (prevents subdomain injection)
        return !prefix.includes('.')
      }
      
      return false
    } catch {
      return false
    }
  }
  
  // Handle simple wildcard patterns like "*.app.cloudhumans.com" (no protocol)
  if (pattern.startsWith('*.')) {
    const domain = pattern.substring(2)
    try {
      const originUrl = new URL(origin)
      const hostname = originUrl.hostname
      
      // Check exact match first
      if (hostname === domain) return true
      
      // For wildcard, ensure it's a direct subdomain (only one additional level)
      if (hostname.endsWith('.' + domain)) {
        const prefix = hostname.replace('.' + domain, '')
        // Ensure the prefix doesn't contain dots (prevents subdomain injection)
        return !prefix.includes('.')
      }
      
      return false
    } catch {
      return false
    }
  }
  
  // Exact match for full URLs or simple patterns
  return origin === pattern
}

/**
 * Helper function to check if an origin is allowed against a list of patterns
 * @param origin - The origin to check
 * @param allowedPatterns - Array of allowed origin patterns (may include wildcards)
 * @returns true if the origin matches any of the allowed patterns
 */
export const isOriginAllowed = (origin: string, allowedPatterns: string[]): boolean => {
  return allowedPatterns.some(pattern => matchesOriginPattern(origin, pattern))
}