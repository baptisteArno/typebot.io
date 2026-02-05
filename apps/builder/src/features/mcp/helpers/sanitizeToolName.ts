/**
 * Normalize a tool name to be MCP-compliant.
 * MCP tool names must be lowercase, URL-safe, without spaces.
 */
export function sanitizeToolName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
}
