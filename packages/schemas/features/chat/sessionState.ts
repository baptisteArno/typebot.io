import { z } from 'zod'
import { answerSchema } from '../answer'
import { resultSchema } from '../result'
import { typebotInSessionStateSchema, dynamicThemeSchema } from './shared'
import { settingsSchema } from '../typebot/settings'

const answerInSessionStateSchema = answerSchema.pick({
  content: true,
  blockId: true,
  variableId: true,
})

const answerInSessionStateSchemaV2 = z.object({
  key: z.string(),
  value: z.string(),
})

export type AnswerInSessionState = z.infer<typeof answerInSessionStateSchemaV2>

const resultInSessionStateSchema = resultSchema
  .pick({
    variables: true,
  })
  .merge(
    z.object({
      answers: z.array(answerInSessionStateSchema),
      id: z.string().optional(),
    })
  )

const sessionStateSchemaV1 = z.object({
  version: z.undefined(),
  typebot: typebotInSessionStateSchema,
  dynamicTheme: dynamicThemeSchema.optional(),
  linkedTypebots: z.object({
    typebots: z.array(typebotInSessionStateSchema),
    queue: z.array(z.object({ edgeId: z.string(), typebotId: z.string() })),
  }),
  currentTypebotId: z.string(),
  result: resultInSessionStateSchema,
  currentBlock: z
    .object({
      blockId: z.string(),
    })
    .optional(),
  isStreamEnabled: z.boolean().optional(),
})

const sessionStateSchemaV2 = z.object({
  version: z.literal('2'),
  typebotsQueue: z.array(
    z.object({
      edgeIdToTriggerWhenDone: z.string().optional(),
      isMergingWithParent: z.boolean().optional(),
      resultId: z.string().optional(),
      answers: z.array(answerInSessionStateSchemaV2),
      typebot: typebotInSessionStateSchema,
    })
  ),
  dynamicTheme: dynamicThemeSchema.optional(),
  currentBlock: z
    .object({
      blockId: z.string(),
    })
    .optional(),
  isStreamEnabled: z.boolean().optional(),
  whatsApp: z
    .object({
      contact: z.object({
        name: z.string(),
        phoneNumber: z.string(),
      }),
    })
    .optional(),
  expiryTimeout: z
    .number()
    .min(1)
    .optional()
    .describe('Expiry timeout in milliseconds'),
  typingEmulation: settingsSchema.shape.typingEmulation.optional(),
  currentVisitedEdgeIndex: z.number().optional(),
})

const sessionStateSchemaV3 = sessionStateSchemaV2
  .omit({ currentBlock: true })
  .extend({
    version: z.literal('3'),
    currentBlockId: z.string().optional(),
  })

export type SessionState = z.infer<typeof sessionStateSchemaV3>

export const sessionStateSchema = z
  .discriminatedUnion('version', [
    sessionStateSchemaV1,
    sessionStateSchemaV2,
    sessionStateSchemaV3,
  ])
  .transform((state): SessionState => {
    if (state.version === '3') return state
    let migratedState: any = state
    if (!state.version) migratedState = migrateFromV1ToV2(state)
    return migrateFromV2ToV3(migratedState)
  })

const migrateFromV1ToV2 = (
  state: z.infer<typeof sessionStateSchemaV1>
): z.infer<typeof sessionStateSchemaV2> => ({
  version: '2',
  typebotsQueue: [
    {
      typebot: state.typebot,
      resultId: state.result.id,
      answers: state.result.answers.map((answer) => ({
        key:
          (answer.variableId
            ? state.typebot.variables.find(
                (variable) => variable.id === answer.variableId
              )?.name
            : state.typebot.groups.find((group) =>
                group.blocks.find((block) => block.id === answer.blockId)
              )?.title) ?? '',
        value: answer.content,
      })),
      isMergingWithParent: true,
      edgeIdToTriggerWhenDone:
        state.linkedTypebots.queue.length > 0
          ? state.linkedTypebots.queue[0].edgeId
          : undefined,
    },
    ...state.linkedTypebots.typebots.map(
      (typebot, index) =>
        ({
          typebot,
          resultId: state.result.id,
          answers: state.result.answers.map((answer) => ({
            key:
              (answer.variableId
                ? state.typebot.variables.find(
                    (variable) => variable.id === answer.variableId
                  )?.name
                : state.typebot.groups.find((group) =>
                    group.blocks.find((block) => block.id === answer.blockId)
                  )?.title) ?? '',
            value: answer.content,
          })),
          edgeIdToTriggerWhenDone: state.linkedTypebots.queue.at(index + 1)
            ?.edgeId,
        } satisfies SessionState['typebotsQueue'][number])
    ),
  ],
  dynamicTheme: state.dynamicTheme,
  currentBlock: state.currentBlock,
  isStreamEnabled: state.isStreamEnabled,
})

const migrateFromV2ToV3 = (
  state: z.infer<typeof sessionStateSchemaV2>
): z.infer<typeof sessionStateSchemaV3> => ({
  ...state,
  version: '3',
  currentBlockId: state.currentBlock?.blockId,
})
