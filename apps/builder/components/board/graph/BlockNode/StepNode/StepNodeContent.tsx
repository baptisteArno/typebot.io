import { Flex, Text } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import {
  Step,
  StartStep,
  BubbleStepType,
  InputStepType,
  LogicStepType,
  SetVariableStep,
} from 'models'
import { ChoiceItemsList } from './ChoiceInputStepNode/ChoiceItemsList'

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
