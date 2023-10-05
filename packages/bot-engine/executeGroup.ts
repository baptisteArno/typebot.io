import {
  BubbleBlock,
  BubbleBlockType,
  ChatReply,
  Group,
  InputBlock,
  InputBlockType,
  RuntimeOptions,
  SessionState,
  Variable,
} from '@typebot.io/schemas'
import {
  isBubbleBlock,
  isEmpty,
  isInputBlock,
  isIntegrationBlock,
  isLogicBlock,
  isNotEmpty,
} from '@typebot.io/lib'
import { getNextGroup } from './getNextGroup'
import { executeLogic } from './executeLogic'
import { executeIntegration } from './executeIntegration'
import { computePaymentInputRuntimeOptions } from './blocks/inputs/payment/computePaymentInputRuntimeOptions'
import { injectVariableValuesInButtonsInputBlock } from './blocks/inputs/buttons/injectVariableValuesInButtonsInputBlock'
import { injectVariableValuesInPictureChoiceBlock } from './blocks/inputs/pictureChoice/injectVariableValuesInPictureChoiceBlock'
import { getPrefilledInputValue } from './getPrefilledValue'
import { parseDateInput } from './blocks/inputs/date/parseDateInput'
import { deepParseVariables } from './variables/deepParseVariables'
import { parseVideoUrl } from '@typebot.io/lib/parseVideoUrl'
import { TDescendant, createPlateEditor } from '@udecode/plate-common'
import {
  createDeserializeMdPlugin,
  deserializeMd,
} from '@udecode/plate-serializer-md'
import { getVariablesToParseInfoInText } from './variables/parseVariables'

export const executeGroup =
  (
    state: SessionState,
    currentReply?: ChatReply,
    currentLastBubbleId?: string
  ) =>
  async (
    group: Group
  ): Promise<ChatReply & { newSessionState: SessionState }> => {
    const messages: ChatReply['messages'] = currentReply?.messages ?? []
    let clientSideActions: ChatReply['clientSideActions'] =
      currentReply?.clientSideActions
    let logs: ChatReply['logs'] = currentReply?.logs
    let nextEdgeId = null
    let lastBubbleBlockId: string | undefined = currentLastBubbleId

    let newSessionState = state

    for (const block of group.blocks) {
      nextEdgeId = block.outgoingEdgeId

      if (isBubbleBlock(block)) {
        messages.push(
          parseBubbleBlock(newSessionState.typebotsQueue[0].typebot.variables)(
            block
          )
        )
        lastBubbleBlockId = block.id
        continue
      }

      if (isInputBlock(block))
        return {
          messages,
          input: await parseInput(newSessionState)(block),
          newSessionState: {
            ...newSessionState,
            currentBlock: {
              groupId: group.id,
              blockId: block.id,
            },
          },
          clientSideActions,
          logs,
        }
      const executionResponse = isLogicBlock(block)
        ? await executeLogic(newSessionState)(block)
        : isIntegrationBlock(block)
        ? await executeIntegration(newSessionState)(block)
        : null

      if (!executionResponse) continue
      if (executionResponse.logs)
        logs = [...(logs ?? []), ...executionResponse.logs]
      if (executionResponse.newSessionState)
        newSessionState = executionResponse.newSessionState
      if (
        'clientSideActions' in executionResponse &&
        executionResponse.clientSideActions
      ) {
        clientSideActions = [
          ...(clientSideActions ?? []),
          ...executionResponse.clientSideActions.map((action) => ({
            ...action,
            lastBubbleBlockId,
          })),
        ]
        if (
          executionResponse.clientSideActions?.find(
            (action) => action.expectsDedicatedReply
          )
        ) {
          return {
            messages,
            newSessionState: {
              ...newSessionState,
              currentBlock: {
                groupId: group.id,
                blockId: block.id,
              },
            },
            clientSideActions,
            logs,
          }
        }
      }

      if (executionResponse.outgoingEdgeId) {
        nextEdgeId = executionResponse.outgoingEdgeId
        break
      }
    }

    if (!nextEdgeId && newSessionState.typebotsQueue.length === 1)
      return { messages, newSessionState, clientSideActions, logs }

    const nextGroup = await getNextGroup(newSessionState)(
      nextEdgeId ?? undefined
    )

    newSessionState = nextGroup.newSessionState

    if (!nextGroup.group) {
      return { messages, newSessionState, clientSideActions, logs }
    }

    return executeGroup(
      newSessionState,
      {
        messages,
        clientSideActions,
        logs,
      },
      lastBubbleBlockId
    )(nextGroup.group)
  }

const computeRuntimeOptions =
  (state: SessionState) =>
  (block: InputBlock): Promise<RuntimeOptions> | undefined => {
    switch (block.type) {
      case InputBlockType.PAYMENT: {
        return computePaymentInputRuntimeOptions(state)(block.options)
      }
    }
  }

const parseBubbleBlock =
  (variables: Variable[]) =>
  (block: BubbleBlock): ChatReply['messages'][0] => {
    switch (block.type) {
      case BubbleBlockType.TEXT: {
        return {
          ...block,
          content: {
            ...block.content,
            richText: parseVariablesInRichText(
              block.content.richText,
              variables
            ),
          },
        }
      }

      case BubbleBlockType.EMBED: {
        const message = deepParseVariables(variables)(block)
        return {
          ...message,
          content: {
            ...message.content,
            height:
              typeof message.content.height === 'string'
                ? parseFloat(message.content.height)
                : message.content.height,
          },
        }
      }
      case BubbleBlockType.VIDEO: {
        const parsedContent = deepParseVariables(variables)(block.content)
        return {
          ...block,
          content: parsedContent.url ? parseVideoUrl(parsedContent.url) : {},
        }
      }
      default:
        return deepParseVariables(variables)(block)
    }
  }

const parseVariablesInRichText = (
  elements: TDescendant[],
  variables: Variable[]
): TDescendant[] => {
  const parsedElements: TDescendant[] = []
  for (const element of elements) {
    if ('text' in element) {
      const text = element.text as string
      if (isEmpty(text)) {
        parsedElements.push(element)
        continue
      }
      const variablesInText = getVariablesToParseInfoInText(text, variables)
      if (variablesInText.length === 0) {
        parsedElements.push(element)
        continue
      }
      for (const variableInText of variablesInText) {
        const textBeforeVariable = text.substring(0, variableInText.startIndex)
        const textAfterVariable = text.substring(variableInText.endIndex)
        const isStandaloneElement =
          isEmpty(textBeforeVariable) && isEmpty(textAfterVariable)
        const variableElements = convertMarkdownToRichText(
          isStandaloneElement
            ? variableInText.value
            : variableInText.value.replace(/[\n]+/g, ' ')
        )
        const variableElementsWithStyling = variableElements.map(
          (variableElement) => ({
            ...variableElement,
            children: [
              ...(variableElement.children as TDescendant[]).map((child) => ({
                ...element,
                ...child,
              })),
            ],
          })
        )
        if (isStandaloneElement) {
          parsedElements.push(...variableElementsWithStyling)
          continue
        }
        const children: TDescendant[] = []
        if (isNotEmpty(textBeforeVariable))
          children.push({
            ...element,
            text: textBeforeVariable,
          })
        children.push({
          type: 'inline-variable',
          children: variableElementsWithStyling,
        })
        if (isNotEmpty(textAfterVariable))
          children.push({
            ...element,
            text: textAfterVariable,
          })
        parsedElements.push(...children)
      }
      continue
    }

    const type =
      element.children.length === 1 &&
      'text' in element.children[0] &&
      (element.children[0].text as string).startsWith('{{') &&
      (element.children[0].text as string).endsWith('}}')
        ? 'variable'
        : element.type

    parsedElements.push({
      ...element,
      type,
      children: parseVariablesInRichText(
        element.children as TDescendant[],
        variables
      ),
    })
  }
  return parsedElements
}

const convertMarkdownToRichText = (text: string): TDescendant[] => {
  const plugins = [createDeserializeMdPlugin()]
  //@ts-ignore
  return deserializeMd(createPlateEditor({ plugins }), text)
}

export const parseInput =
  (state: SessionState) =>
  async (block: InputBlock): Promise<ChatReply['input']> => {
    switch (block.type) {
      case InputBlockType.CHOICE: {
        return injectVariableValuesInButtonsInputBlock(state)(block)
      }
      case InputBlockType.PICTURE_CHOICE: {
        return injectVariableValuesInPictureChoiceBlock(
          state.typebotsQueue[0].typebot.variables
        )(block)
      }
      case InputBlockType.NUMBER: {
        const parsedBlock = deepParseVariables(
          state.typebotsQueue[0].typebot.variables
        )({
          ...block,
          prefilledValue: getPrefilledInputValue(
            state.typebotsQueue[0].typebot.variables
          )(block),
        })
        return {
          ...parsedBlock,
          options: {
            ...parsedBlock.options,
            min: isNotEmpty(parsedBlock.options.min as string)
              ? Number(parsedBlock.options.min)
              : undefined,
            max: isNotEmpty(parsedBlock.options.max as string)
              ? Number(parsedBlock.options.max)
              : undefined,
            step: isNotEmpty(parsedBlock.options.step as string)
              ? Number(parsedBlock.options.step)
              : undefined,
          },
        }
      }
      case InputBlockType.DATE: {
        return parseDateInput(state)(block)
      }
      default: {
        return deepParseVariables(state.typebotsQueue[0].typebot.variables)({
          ...block,
          runtimeOptions: await computeRuntimeOptions(state)(block),
          prefilledValue: getPrefilledInputValue(
            state.typebotsQueue[0].typebot.variables
          )(block),
        })
      }
    }
  }
