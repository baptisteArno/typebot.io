import { Box, Image, Text } from '@chakra-ui/react'
import {
  Step,
  StartStep,
  BubbleStepType,
  InputStepType,
  LogicStepType,
  IntegrationStepType,
} from 'models'
import { isInputStep } from 'utils'
import { ChoiceItemsList } from '../ChoiceInputStepNode/ChoiceItemsList'
import { ConditionNodeContent } from './ConditionNodeContent'
import { SetVariableNodeContent } from './SetVariableNodeContent'
import { StepNodeContentWithVariable } from './StepNodeContentWithVariable'
import { TextBubbleNodeContent } from './TextBubbleNodeContent'
import { VideoStepNodeContent } from './VideoStepNodeContent'
import { WebhookContent } from './WebhookContent'

type Props = {
  step: Step | StartStep
  isConnectable?: boolean
}
export const StepNodeContent = ({ step }: Props) => {
  if (isInputStep(step) && step.options.variableId) {
    return <StepNodeContentWithVariable step={step} />
  }
  switch (step.type) {
    case BubbleStepType.TEXT: {
      return <TextBubbleNodeContent step={step} />
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
    case BubbleStepType.VIDEO: {
      return <VideoStepNodeContent step={step} />
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
      return <Text color={'gray.500'}>Pick a date...</Text>
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
      if (!step.options.url) return <Text color={'gray.500'}>Configure...</Text>
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
    case IntegrationStepType.WEBHOOK: {
      return <WebhookContent step={step} />
    }
    case 'start': {
      return <Text>{step.label}</Text>
    }
    default: {
      return <Text>No input</Text>
    }
  }
}
