import { z } from 'zod'
import { credentialsBaseSchema } from './blocks/baseSchemas'
import { ComparisonOperators, LogicalOperator } from './blocks/logic/condition'

const mediaSchema = z.object({ link: z.string() })

const headerSchema = z
  .object({
    type: z.literal('image'),
    image: mediaSchema,
  })
  .or(
    z.object({
      type: z.literal('video'),
      video: mediaSchema,
    })
  )
  .or(
    z.object({
      type: z.literal('text'),
      text: z.string(),
    })
  )

const bodySchema = z.object({
  text: z.string(),
})

const actionSchema = z.object({
  buttons: z.array(
    z.object({
      type: z.literal('reply'),
      reply: z.object({ id: z.string(), title: z.string() }),
    })
  ),
})

const templateSchema = z.object({
  name: z.literal('preview_initial_message'),
  language: z.object({
    code: z.literal('en'),
  }),
})

const interactiveSchema = z.object({
  type: z.literal('button'),
  header: headerSchema.optional(),
  body: bodySchema.optional(),
  action: actionSchema,
})

// https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#message-object
const sendingMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    text: z.object({
      body: z.string(),
      preview_url: z.boolean().optional(),
    }),
    preview_url: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('image'),
    image: mediaSchema,
  }),
  z.object({
    type: z.literal('audio'),
    audio: mediaSchema,
  }),
  z.object({
    type: z.literal('video'),
    video: mediaSchema,
  }),
  z.object({
    type: z.literal('interactive'),
    interactive: interactiveSchema,
  }),
  z.object({
    type: z.literal('template'),
    template: templateSchema,
  }),
])

export const incomingMessageSchema = z.discriminatedUnion('type', [
  z.object({
    from: z.string(),
    type: z.literal('text'),
    text: z.object({
      body: z.string(),
    }),
    timestamp: z.string(),
  }),
  z.object({
    from: z.string(),
    type: z.literal('button'),
    button: z.object({
      text: z.string(),
      payload: z.string(),
    }),
    timestamp: z.string(),
  }),
  z.object({
    from: z.string(),
    type: z.literal('interactive'),
    interactive: z.object({
      button_reply: z.object({
        id: z.string(),
        title: z.string(),
      }),
    }),
    timestamp: z.string(),
  }),
  z.object({
    from: z.string(),
    type: z.literal('image'),
    image: z.object({ id: z.string() }),
    timestamp: z.string(),
  }),
  z.object({
    from: z.string(),
    type: z.literal('video'),
    video: z.object({ id: z.string() }),
    timestamp: z.string(),
  }),
  z.object({
    from: z.string(),
    type: z.literal('audio'),
    audio: z.object({ id: z.string() }),
    timestamp: z.string(),
  }),
  z.object({
    from: z.string(),
    type: z.literal('document'),
    document: z.object({ id: z.string() }),
    timestamp: z.string(),
  }),
])

export const whatsAppWebhookRequestBodySchema = z.object({
  entry: z.array(
    z.object({
      changes: z.array(
        z.object({
          value: z.object({
            contacts: z
              .array(
                z.object({
                  profile: z.object({
                    name: z.string(),
                  }),
                })
              )
              .optional(),
            metadata: z.object({
              display_phone_number: z.string(),
            }),
            messages: z.array(incomingMessageSchema).optional(),
          }),
        })
      ),
    })
  ),
})

export const whatsAppCredentialsSchema = z
  .object({
    type: z.literal('whatsApp'),
    data: z.object({
      systemUserAccessToken: z.string(),
      phoneNumberId: z.string(),
    }),
  })
  .merge(credentialsBaseSchema)

const whatsAppComparisonSchema = z.object({
  id: z.string(),
  comparisonOperator: z.nativeEnum(ComparisonOperators).optional(),
  value: z.string().optional(),
})
export type WhatsAppComparison = z.infer<typeof whatsAppComparisonSchema>

const startConditionSchema = z.object({
  logicalOperator: z.nativeEnum(LogicalOperator),
  comparisons: z.array(
    z.object({
      id: z.string(),
      comparisonOperator: z.nativeEnum(ComparisonOperators).optional(),
      value: z.string().optional(),
    })
  ),
})

export const whatsAppSettingsSchema = z.object({
  credentialsId: z.string().optional(),
  startCondition: startConditionSchema.optional(),
})

export type WhatsAppIncomingMessage = z.infer<typeof incomingMessageSchema>
export type WhatsAppSendingMessage = z.infer<typeof sendingMessageSchema>
export type WhatsAppCredentials = z.infer<typeof whatsAppCredentialsSchema>
