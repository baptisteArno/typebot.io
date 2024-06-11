import { z } from '../../zod'
import { extendZodWithOpenApi } from 'zod-openapi'
import { listVariableValue } from '../typebot/variable'
import {
  googleAnalyticsOptionsSchema,
  executableHttpRequestSchema,
  pixelOptionsSchema,
  redirectOptionsSchema,
} from '../blocks'
import { nativeMessageSchema } from '../blocks/integrations/openai'

extendZodWithOpenApi(z)

const startPropsToInjectSchema = z.object({
  googleAnalyticsId: z.string().optional(),
  pixelIds: z.array(z.string()).optional(),
  gtmId: z.string().optional(),
  customHeadCode: z.string().optional(),
})
export type StartPropsToInject = z.infer<typeof startPropsToInjectSchema>

const scriptToExecuteSchema = z.object({
  content: z.string(),
  isCode: z.boolean().optional(),
  args: z.array(
    z.object({
      id: z.string(),
      value: z
        .string()
        .or(z.number())
        .or(z.boolean())
        .or(listVariableValue)
        .nullish(),
    })
  ),
})
export type ScriptToExecute = z.infer<typeof scriptToExecuteSchema>

const clientSideActionBaseSchema = z.object({
  lastBubbleBlockId: z.string().optional(),
  expectsDedicatedReply: z.boolean().optional(),
})

export const clientSideActionSchema = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('scriptToExecute'),
      scriptToExecute: scriptToExecuteSchema,
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: 'csaScriptToExecute',
      title: 'Script to execute',
    }),
  z
    .object({
      type: z.literal('redirect'),
      redirect: redirectOptionsSchema,
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: 'csaRedirect',
      title: 'Redirect',
    }),
  z
    .object({
      type: z.literal('chatwoot'),
      chatwoot: z.object({ scriptToExecute: scriptToExecuteSchema }),
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: 'csaChatwoot',
      title: 'Chatwoot',
    }),
  z
    .object({
      type: z.literal('googleAnalytics'),
      googleAnalytics: googleAnalyticsOptionsSchema,
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: 'csaGa',
      title: 'Google Analytics',
    }),
  z
    .object({
      type: z.literal('wait'),
      wait: z.object({
        secondsToWaitFor: z.number(),
      }),
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: 'csaWait',
      title: 'Wait',
    }),
  z
    .object({
      type: z.literal('setVariable'),
      setVariable: z.object({ scriptToExecute: scriptToExecuteSchema }),
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: 'csaSetVariable',
      title: 'Set variable',
    }),
  z
    .object({
      type: z.literal('streamOpenAiChatCompletion'),
      streamOpenAiChatCompletion: z.object({
        messages: z.array(
          nativeMessageSchema.pick({ content: true, role: true })
        ),
      }),
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: 'csaStreamOpenAiChatCompletion',
      title: 'Stream OpenAI',
    }),
  z
    .object({
      type: z.literal('webhookToExecute'),
      webhookToExecute: executableHttpRequestSchema,
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: 'csaExecWebhook',
      title: 'Execute webhook',
    }),
  z
    .object({
      type: z.literal('startPropsToInject'),
      startPropsToInject: startPropsToInjectSchema,
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: 'csaInjectStartProps',
      title: 'Inject start props',
    }),
  z
    .object({
      type: z.literal('pixel'),
      pixel: pixelOptionsSchema,
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: 'csaPixel',
      title: 'Init Pixel',
    }),
  z
    .object({
      type: z.literal('stream'),
      stream: z.literal(true),
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: 'csaStream',
      title: 'Exec stream',
    }),
  z
    .object({
      type: z.literal('codeToExecute'),
      codeToExecute: z.object({
        args: z.record(z.string(), z.unknown()),
        content: z.string(),
      }),
    })
    .merge(clientSideActionBaseSchema)
    .openapi({
      ref: 'csaCodeToExecute',
      title: 'Execute code',
    }),
])
