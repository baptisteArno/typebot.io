import { sanitizeToolName } from './sanitizeToolName'
import type { WorkflowTool } from '../types'

/**
 * Transform a Typebot workflow tool to MCP tool format.
 */
export function transformToMCPTool(tool: WorkflowTool) {
  const properties: Record<string, { type: string; description: string }> = {}
  const required: string[] = []

  ;(tool.variables || []).forEach((v) => {
    if (v.name) {
      properties[v.name] = {
        type: 'string',
        description: v.description || `Input for ${v.name}`,
      }
      required.push(v.name)
    }
  })

  return {
    name: sanitizeToolName(tool.name),
    description: tool.description || `Execute ${tool.name}`,
    inputSchema: {
      type: 'object' as const,
      properties,
      required,
    },
  }
}
