import { z } from '../../zod'
import {
  buttonsInputSchemas,
  dateInputSchema,
  emailInputSchema,
  fileInputBlockSchemas,
  numberInputSchema,
  paymentInputRuntimeOptionsSchema,
  paymentInputSchema,
  phoneNumberInputBlockSchema,
  pictureChoiceBlockSchemas,
  ratingInputBlockSchema,
  textInputSchema,
  urlInputSchema,
} from '../blocks'
import { logSchema } from '../result'
import { settingsSchema, themeSchema } from '../typebot'
import {
  textBubbleContentSchema,
  imageBubbleContentSchema,
  videoBubbleContentSchema,
  audioBubbleContentSchema,
  embedBubbleContentSchema,
} from '../blocks/bubbles'
import { sessionStateSchema } from './sessionState'
import { dynamicThemeSchema } from './shared'
import { preprocessTypebot } from '../typebot/helpers/preprocessTypebot'
import { typebotV5Schema, typebotV6Schema } from '../typebot/typebot'
import { BubbleBlockType } from '../blocks/bubbles/constants'
import { clientSideActionSchema } from './clientSideAction'

const chatSessionSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  state: sessionStateSchema,
})
export type ChatSession = z.infer<typeof chatSessionSchema>

const textMessageSchema = z
  .object({
    type: z.literal(BubbleBlockType.TEXT),
    content: textBubbleContentSchema,
  })
  .openapi({
    title: 'Text',
    ref: 'textMessage',
  })

const imageMessageSchema = z
  .object({
    type: z.enum([BubbleBlockType.IMAGE]),
    content: imageBubbleContentSchema,
  })
  .openapi({
    title: 'Image',
    ref: 'imageMessage',
  })

const videoMessageSchema = z
  .object({
    type: z.enum([BubbleBlockType.VIDEO]),
    content: videoBubbleContentSchema,
  })
  .openapi({
    title: 'Video',
    ref: 'videoMessage',
  })

const audioMessageSchema = z
  .object({
    type: z.enum([BubbleBlockType.AUDIO]),
    content: audioBubbleContentSchema,
  })
  .openapi({
    title: 'Audio',
    ref: 'audioMessage',
  })

const embedMessageSchema = z
  .object({
    type: z.enum([BubbleBlockType.EMBED]),
    content: embedBubbleContentSchema
      .omit({
        height: true,
      })
      .merge(z.object({ height: z.number().optional() })),
  })
  .openapi({
    title: 'Embed',
    ref: 'embedMessage',
  })

const displayEmbedBubbleSchema = z.object({
  waitForEventFunction: z
    .object({
      args: z.record(z.string(), z.unknown()),
      content: z.string(),
    })
    .optional(),
  initFunction: z.object({
    args: z.record(z.string(), z.unknown()),
    content: z.string(),
  }),
})
const customEmbedSchema = z
  .object({
    type: z.literal('custom-embed'),
    content: displayEmbedBubbleSchema,
  })
  .openapi({
    title: 'Custom embed',
    ref: 'customEmbedMessage',
  })
export type CustomEmbedBubble = z.infer<typeof customEmbedSchema>

export const chatMessageSchema = z
  .object({ id: z.string() })
  .and(
    z.discriminatedUnion('type', [
      textMessageSchema,
      imageMessageSchema,
      videoMessageSchema,
      audioMessageSchema,
      embedMessageSchema,
      customEmbedSchema,
    ])
  )
export type ChatMessage = z.infer<typeof chatMessageSchema>

const startTypebotPick = {
  version: true,
  id: true,
  groups: true,
  events: true,
  edges: true,
  variables: true,
  settings: true,
  theme: true,
} as const
export const startTypebotSchema = z.preprocess(
  preprocessTypebot,
  z.discriminatedUnion('version', [
    typebotV5Schema._def.schema.pick(startTypebotPick).openapi({
      title: 'Typebot V5',
      ref: 'typebotV5',
    }),
    typebotV6Schema.pick(startTypebotPick).openapi({
      title: 'Typebot V6',
      ref: 'typebotV6',
    }),
  ])
)
export type StartTypebot = z.infer<typeof startTypebotSchema>

export const chatLogSchema = logSchema
  .pick({
    status: true,
    description: true,
  })
  .merge(z.object({ details: z.unknown().optional() }))
export type ChatLog = z.infer<typeof chatLogSchema>

export const startChatInputSchema = z.object({
  publicId: z
    .string()
    .describe(
      "[Where to find my bot's public ID?](../how-to#how-to-find-my-publicid)"
    ),
  message: z
    .string()
    .optional()
    .describe(
      "Only provide it if your flow starts with an input block and you'd like to directly provide an answer to it."
    ),
  isStreamEnabled: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'If enabled, you will be required to stream OpenAI completions on a client and send the generated response back to the API.'
    ),
  resultId: z
    .string()
    .optional()
    .describe("Provide it if you'd like to overwrite an existing result."),
  isOnlyRegistering: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'If set to `true`, it will only register the session and not start the bot. This is used for 3rd party chat platforms as it can require a session to be registered before sending the first message.'
    ),
  prefilledVariables: z
    .record(z.unknown())
    .optional()
    .describe(
      '[More info about prefilled variables.](../../editor/variables#prefilled-variables)'
    )
    .openapi({
      example: {
        'First name': 'John',
        Email: 'john@gmail.com',
      },
    }),
})
export type StartChatInput = z.infer<typeof startChatInputSchema>

export const startFromSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('group'),
    groupId: z.string(),
  }),
  z.object({
    type: z.literal('event'),
    eventId: z.string(),
  }),
])
export type StartFrom = z.infer<typeof startFromSchema>

export const startPreviewChatInputSchema = z.object({
  typebotId: z
    .string()
    .describe(
      "[Where to find my bot's ID?](../how-to#how-to-find-my-typebotid)"
    ),
  isStreamEnabled: z.boolean().optional(),
  message: z.string().optional(),
  isOnlyRegistering: z
    .boolean()
    .optional()
    .describe(
      'If set to `true`, it will only register the session and not start the bot. This is used for 3rd party chat platforms as it can require a session to be registered before sending the first message.'
    ),
  typebot: startTypebotSchema
    .optional()
    .describe(
      'If set, it will override the typebot that is used to start the chat.'
    ),
  startFrom: startFromSchema.optional(),
})
export type StartPreviewChatInput = z.infer<typeof startPreviewChatInputSchema>

export const runtimeOptionsSchema = paymentInputRuntimeOptionsSchema.optional()
export type RuntimeOptions = z.infer<typeof runtimeOptionsSchema>

const typebotInChatReplyPick = {
  version: true,
  id: true,
  groups: true,
  edges: true,
  variables: true,
  settings: true,
  theme: true,
} as const
export const typebotInChatReply = z.preprocess(
  preprocessTypebot,
  z.discriminatedUnion('version', [
    typebotV5Schema._def.schema.pick(typebotInChatReplyPick),
    typebotV6Schema.pick(typebotInChatReplyPick),
  ])
)

const chatResponseBaseSchema = z.object({
  lastMessageNewFormat: z
    .string()
    .optional()
    .describe(
      'The sent message is validated and formatted on the backend. For example, if for a date input you replied something like `tomorrow`, the backend will convert it to a date string. This field returns the formatted message.'
    ),
  messages: z.array(chatMessageSchema),
  input: z
    .union([
      z.discriminatedUnion('type', [
        textInputSchema,
        buttonsInputSchemas.v6,
        emailInputSchema,
        numberInputSchema,
        urlInputSchema,
        phoneNumberInputBlockSchema,
        dateInputSchema,
        paymentInputSchema,
        ratingInputBlockSchema,
        fileInputBlockSchemas.v6,
        pictureChoiceBlockSchemas.v6,
      ]),
      z.discriminatedUnion('type', [
        buttonsInputSchemas.v5,
        fileInputBlockSchemas.v5,
        pictureChoiceBlockSchemas.v5,
      ]),
    ])
    .optional(),
  clientSideActions: z
    .array(clientSideActionSchema)
    .optional()
    .describe('Actions to execute on the client side'),
  logs: z
    .array(chatLogSchema)
    .optional()
    .describe('Logs that were saved during the last execution'),
  dynamicTheme: dynamicThemeSchema
    .optional()
    .describe(
      'If the typebot contains dynamic avatars, dynamicTheme returns the new avatar URLs whenever their variables are updated.'
    ),
})

export const startChatResponseSchema = z
  .object({
    sessionId: z
      .string()
      .describe('To save and use for /continueChat requests.'),
    resultId: z.string(),
    typebot: z.object({
      id: z.string(),
      theme: themeSchema,
      settings: settingsSchema,
    }),
  })
  .merge(chatResponseBaseSchema)
export type StartChatResponse = z.infer<typeof startChatResponseSchema>

export const startPreviewChatResponseSchema = startChatResponseSchema.omit({
  resultId: true,
})

export const continueChatResponseSchema = chatResponseBaseSchema
export type ContinueChatResponse = z.infer<typeof continueChatResponseSchema>
