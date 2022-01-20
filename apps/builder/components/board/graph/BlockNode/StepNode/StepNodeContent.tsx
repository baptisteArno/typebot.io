import { Box, Flex, HStack, Image, Stack, Tag, Text } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import {
  Step,
  StartStep,
  BubbleStepType,
  InputStepType,
  LogicStepType,
  SetVariableStep,
  ConditionStep,
  IntegrationStepType,
} from 'models'
import { ChoiceItemsList } from './ChoiceInputStepNode/ChoiceItemsList'
import { SourceEndpoint } from './SourceEndpoint'

type Props = {
  step: Step | StartStep
  isConnectable?: boolean
}
export const StepNodeContent = ({ step }: Props) => {
  switch (step.type) {
    case BubbleStepType.TEXT: {
      return (
        <Flex
          flexDir={'column'}
          opacity={step.content.html === '' ? '0.5' : '1'}
          className="slate-html-container"
          dangerouslySetInnerHTML={{
            __html:
              step.content.html === ''
                ? `<p>Click to edit...</p>`
                : step.content.html,
          }}
        />
      )
    }
    case BubbleStepType.IMAGE: {
      return !step.content?.url ? (
        <Text color={'gray.500'}>Click to edit...</Text>
      ) : (
        <Box w="full">
          <Image
            src={step.content?.url}
            alt="Step image"
            rounded="md"
            objectFit="cover"
          />
        </Box>
      )
    }
    case InputStepType.TEXT: {
      return (
        <Text color={'gray.500'}>
          {step.options?.labels?.placeholder ?? 'Type your answer...'}
        </Text>
      )
    }
    case InputStepType.NUMBER: {
      return (
        <Text color={'gray.500'}>
          {step.options?.labels?.placeholder ?? 'Type your answer...'}
        </Text>
      )
    }
    case InputStepType.EMAIL: {
      return (
        <Text color={'gray.500'}>
          {step.options?.labels?.placeholder ?? 'Type your email...'}
        </Text>
      )
    }
    case InputStepType.URL: {
      return (
        <Text color={'gray.500'}>
          {step.options?.labels?.placeholder ?? 'Type your URL...'}
        </Text>
      )
    }
    case InputStepType.DATE: {
      return (
        <Text color={'gray.500'}>
          {step.options?.labels?.from ?? 'Pick a date...'}
        </Text>
      )
    }
    case InputStepType.PHONE: {
      return (
        <Text color={'gray.500'}>
          {step.options?.labels?.placeholder ?? 'Your phone number...'}
        </Text>
      )
    }
    case InputStepType.CHOICE: {
      return <ChoiceItemsList step={step} />
    }
    case LogicStepType.SET_VARIABLE: {
      return <SetVariableNodeContent step={step} />
    }
    case LogicStepType.CONDITION: {
      return <ConditionNodeContent step={step} />
    }
    case LogicStepType.REDIRECT: {
      if (!step.options) return <Text color={'gray.500'}>Configure...</Text>
      return <Text isTruncated>Redirect to {step.options?.url}</Text>
    }
    case IntegrationStepType.GOOGLE_SHEETS: {
      if (!step.options) return <Text color={'gray.500'}>Configure...</Text>
      return <Text>{step.options?.action}</Text>
    }
    case IntegrationStepType.GOOGLE_ANALYTICS: {
      if (!step.options || !step.options.action)
        return <Text color={'gray.500'}>Configure...</Text>
      return <Text>Track "{step.options?.action}"</Text>
    }
    case 'start': {
      return <Text>{step.label}</Text>
    }
    default: {
      return <Text>No input</Text>
    }
  }
}

const SetVariableNodeContent = ({ step }: { step: SetVariableStep }) => {
  const { typebot } = useTypebot()
  const variableName =
    typebot?.variables.byId[step.options?.variableId ?? '']?.name ?? ''
  const expression = step.options?.expressionToEvaluate ?? ''
  return (
    <Text color={'gray.500'}>
      {variableName === '' && expression === ''
        ? 'Click to edit...'
        : `${variableName} = ${expression}`}
    </Text>
  )
}

const ConditionNodeContent = ({ step }: { step: ConditionStep }) => {
  const { typebot } = useTypebot()
  return (
    <Flex>
      <Stack color={'gray.500'}>
        {step.options?.comparisons.allIds.map((comparisonId, idx) => {
          const comparison = step.options?.comparisons.byId[comparisonId]
          const variable = typebot?.variables.byId[comparison?.variableId ?? '']
          return (
            <HStack key={comparisonId} spacing={1}>
              {idx > 0 && <Text>{step.options?.logicalOperator ?? ''}</Text>}
              {variable?.name && (
                <Tag bgColor="orange.400">{variable.name}</Tag>
              )}
              {comparison.comparisonOperator && (
                <Text>{comparison?.comparisonOperator}</Text>
              )}
              {comparison?.value && (
                <Tag bgColor={'green.400'}>{comparison.value}</Tag>
              )}
            </HStack>
          )
        })}
      </Stack>
      <SourceEndpoint
        source={{
          blockId: step.blockId,
          stepId: step.id,
          conditionType: 'true',
        }}
        pos="absolute"
        top="7px"
        right="15px"
      />
      <SourceEndpoint
        source={{
          blockId: step.blockId,
          stepId: step.id,
          conditionType: 'false',
        }}
        pos="absolute"
        bottom="7px"
        right="15px"
      />
    </Flex>
  )
}
