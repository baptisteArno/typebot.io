import { NextApiRequest, NextApiResponse } from 'next'
import {
  getWorkflowTools,
  executeWorkflow,
  sanitizeToolName,
  extractToolOutput,
  transformToMCPTool,
} from '@/features/mcp'
import logger from '@/helpers/logger'

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
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, x-tenant, tenant, mcp-session-id, Authorization, X-MCP-Access-Token'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Extract tenant from headers or query
  const tenant = (req.headers['x-tenant'] ||
    req.headers['tenant'] ||
    req.query.tenant) as string | undefined

  logger.info('MCP request received', {
    method: req.method,
    tenant,
    headers: Object.fromEntries(
      Object.entries(req.headers).filter(([k]) =>
        [
          'x-tenant',
          'tenant',
          'content-type',
          'accept',
          'authorization',
          'host',
        ].includes(k)
      )
    ),
    body: req.method === 'POST' ? req.body?.method : undefined,
  })

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
        logger.info('MCP initialize', { tenant, requestId: id })
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
          logger.warn('MCP tools/list called without tenant', { requestId: id })
          return res.status(200).json({
            jsonrpc: '2.0',
            result: { tools: [] },
            id,
          })
        }

        logger.info('MCP tools/list', { tenant, requestId: id })
        const { tools } = await getWorkflowTools({ tenant })

        const mcpTools = tools.map(transformToMCPTool)
        logger.info('MCP tools/list completed', {
          tenant,
          toolCount: mcpTools.length,
          requestId: id,
        })

        return res.status(200).json({
          jsonrpc: '2.0',
          result: { tools: mcpTools },
          id,
        })
      }

      if (method === 'tools/call') {
        if (!tenant) {
          logger.warn('MCP tools/call called without tenant', { requestId: id })
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
        logger.info('MCP tools/call', { tenant, toolName: name, requestId: id })

        const { tools } = await getWorkflowTools({ tenant })
        const tool = tools.find((t) => sanitizeToolName(t.name) === name)

        if (!tool) {
          logger.warn('MCP tool not found', {
            tenant,
            toolName: name,
            availableTools: tools.map((t) => sanitizeToolName(t.name)),
            requestId: id,
          })
          return res.status(200).json({
            jsonrpc: '2.0',
            error: {
              code: -32601,
              message: `Tool '${name}' not found`,
            },
            id,
          })
        }

        const startTime = Date.now()
        const result = await executeWorkflow({
          publicId: tool.publicName,
          prefilledVariables: args as Record<string, unknown>,
        })
        const durationMs = Date.now() - startTime

        const output = extractToolOutput(result)
        logger.info('MCP tools/call completed', {
          tenant,
          toolName: name,
          workflowId: tool.id,
          publicName: tool.publicName,
          durationMs,
          requestId: id,
        })

        return res.status(200).json({
          jsonrpc: '2.0',
          result: {
            content: [{ type: 'text', text: output }],
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
      logger.warn('MCP unknown method', {
        tenant,
        method,
        requestId: id,
      })
      return res.status(200).json({
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: `Method not found: ${method}`,
        },
        id,
      })
    } catch (error) {
      logger.error('MCP request failed', {
        tenant,
        method: req.body?.method,
        requestId: req.body?.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
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
