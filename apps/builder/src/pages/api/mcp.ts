import { NextApiRequest, NextApiResponse } from 'next'
import {
  getWorkflowTools,
  executeWorkflow,
  sanitizeToolName,
  extractToolOutput,
} from '@/features/mcp'

/**
 * MCP (Model Context Protocol) endpoint.
 * Handles Streamable HTTP transport for MCP clients.
 *
 * Tenant is extracted from:
 * - x-tenant header
 * - tenant header
 * - tenant query parameter
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-tenant, tenant, mcp-session-id, Authorization, X-MCP-Access-Token')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Extract tenant from headers or query
  const tenant = (
    req.headers['x-tenant'] ||
    req.headers['tenant'] ||
    req.query.tenant
  ) as string | undefined

  if (req.method === 'GET') {
    // SSE endpoint for server-to-client messages
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    
    // Establishing the stream
    res.write('retry: 1000\n\n')
    
    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write(':keepalive\n\n')
    }, 30000)
    
    req.on('close', () => {
      clearInterval(keepAlive)
      res.end()
    })
    
    return
  }

  if (req.method === 'POST') {
    try {
      const body = req.body
      
      // Handle JSON-RPC request
      const { method, params, id } = body
      
      if (method === 'initialize') {
        return res.status(200).json({
          jsonrpc: '2.0',
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: 'typebot-mcp',
              version: '1.0.0',
            },
          },
          id,
        })
      }
      
      if (method === 'tools/list') {
        if (!tenant) {
          return res.status(200).json({
            jsonrpc: '2.0',
            result: { tools: [] },
            id,
          })
        }
        
        const { tools } = await getWorkflowTools({ tenant })
        
        const mcpTools = tools.map((tool) => {
          const properties: Record<string, { type: string; description: string }> = {}
          const required: string[] = []
          
          for (const v of tool.variables || []) {
            if (v.name) {
              properties[v.name] = {
                type: 'string',
                description: v.description || `Input for ${v.name}`,
              }
              required.push(v.name)
            }
          }
          
          return {
            name: sanitizeToolName(tool.name),
            description: tool.description || `Execute ${tool.name}`,
            inputSchema: {
              type: 'object',
              properties,
              required,
            },
          }
        })
        
        return res.status(200).json({
          jsonrpc: '2.0',
          result: { tools: mcpTools },
          id,
        })
      }
      
      if (method === 'tools/call') {
        if (!tenant) {
          return res.status(200).json({
            jsonrpc: '2.0',
            error: {
              code: -32600,
              message: 'x-tenant header is required for tools/call',
            },
            id,
          })
        }
        
        const { name, arguments: args } = params || {}
        const { tools } = await getWorkflowTools({ tenant })
        const tool = tools.find((t) => sanitizeToolName(t.name) === name)
        
        if (!tool) {
          return res.status(200).json({
            jsonrpc: '2.0',
            error: {
              code: -32601,
              message: `Tool '${name}' not found`,
            },
            id,
          })
        }
        
        const result = await executeWorkflow({
          publicId: tool.publicName,
          prefilledVariables: args as Record<string, unknown>,
        })
        
        return res.status(200).json({
          jsonrpc: '2.0',
          result: {
            content: [{ type: 'text', text: extractToolOutput(result) }],
          },
          id,
        })
      }
      
      if (method === 'notifications/initialized') {
        // Acknowledgment, no response needed for notifications
        return res.status(200).json({
          jsonrpc: '2.0',
          result: {},
          id,
        })
      }
      
      // Unknown method
      return res.status(200).json({
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: `Method not found: ${method}`,
        },
        id,
      })
    } catch (error) {
      console.error('MCP request failed:', error)
      return res.status(200).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : 'Internal error',
        },
        id: req.body?.id ?? null,
      })
    }
  }

  if (req.method === 'DELETE') {
    // Session termination
    return res.status(200).json({
      jsonrpc: '2.0',
      result: {},
      id: null,
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

// Disable body parsing size limit for streaming
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
    externalResolver: true,
  },
}
