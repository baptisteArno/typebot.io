import { z } from '../../zod'
import { answerSchema } from '../answer'
import { resultSchema, setVariableHistoryItemSchema } from '../result'
import { typebotInSessionStateSchema, dynamicThemeSchema } from './shared'
import { settingsSchema } from '../typebot/settings'
import { isInputBlock } from '../../helpers'

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
      answers: z.array(answerSchema),
      id: z.string().optional(),
    })
  )

const sessionStateSchemaV1 = z.object({
  version: z.undefined().openapi({
    type: 'string',
  }),
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
  progressMetadata: z
    .object({
      totalAnswers: z.number(),
    })
    .optional(),
})

const sessionStateSchemaV3 = sessionStateSchemaV2
  .omit({ currentBlock: true })
  .extend({
    version: z.literal('3'),
    currentBlockId: z.string().optional(),
    allowedOrigins: z.array(z.string()).optional(),
    setVariableIdsForHistory: z.array(z.string()).optional(),
    currentSetVariableHistoryIndex: z.number().optional(),
    previewMetadata: z
      .object({
        answers: z.array(answerSchema).optional(),
        visitedEdges: z.array(z.string()).optional(),
        setVariableHistory: z
          .array(
            setVariableHistoryItemSchema.pick({
              blockId: true,
              variableId: true,
              value: true,
            })
          )
          .optional(),
      })
      .optional(),
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let migratedState: any = state
    if (!state.version) migratedState = migrateFromV1ToV2(state)
    return migrateFromV2ToV3(migratedState)
  }) as z.ZodType<SessionState>

const migrateFromV1ToV2 = (
  state: z.infer<typeof sessionStateSchemaV1>
): z.infer<typeof sessionStateSchemaV2> => ({
  version: '2',
  typebotsQueue: [
    {
      typebot: state.typebot,
      resultId: state.result.id,
      answers: state.result.answers.map((answer) => {
        let answerVariableId: string | undefined
        state.typebot.groups.forEach((group) => {
          group.blocks.forEach((block) => {
            if (isInputBlock(block) && block.id === answer.blockId) {
              answerVariableId = block.options?.variableId
            }
          })
        })
        return {
          key:
            (answerVariableId
              ? state.typebot.variables.find(
                  (variable) => variable.id === answerVariableId
                )?.name
              : state.typebot.groups.find((group) =>
                  group.blocks.find((block) => block.id === answer.blockId)
                )?.title) ?? '',
          value: answer.content,
        }
      }),
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
          answers: state.result.answers.map((answer) => {
            let answerVariableId: string | undefined
            typebot.groups.forEach((group) => {
              group.blocks.forEach((block) => {
                if (isInputBlock(block) && block.id === answer.blockId) {
                  answerVariableId = block.options?.variableId
                }
              })
            })
            return {
              key:
                (answerVariableId
                  ? state.typebot.variables.find(
                      (variable) => variable.id === answerVariableId
                    )?.name
                  : state.typebot.groups.find((group) =>
                      group.blocks.find((block) => block.id === answer.blockId)
                    )?.title) ?? '',
              value: answer.content,
            }
          }),
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
