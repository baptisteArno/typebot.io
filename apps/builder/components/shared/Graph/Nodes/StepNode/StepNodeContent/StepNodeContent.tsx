import { Text } from '@chakra-ui/react'
import {
  Step,
  StartStep,
  BubbleStepType,
  InputStepType,
  LogicStepType,
  IntegrationStepType,
} from 'models'
import { isInputStep } from 'utils'
import { ButtonNodesList } from '../../ButtonNode'
import {
  ConditionContent,
  SetVariableContent,
  TextBubbleContent,
  VideoBubbleContent,
  WebhookContent,
  WithVariableContent,
} from './contents'
import { ConfigureContent } from './contents/ConfigureContent'
import { ImageBubbleContent } from './contents/ImageBubbleContent'
import { PlaceholderContent } from './contents/PlaceholderContent'

type Props = {
  step: Step | StartStep
  isConnectable?: boolean
}
export const StepNodeContent = ({ step }: Props) => {
  if (isInputStep(step) && step.options.variableId) {
    return <WithVariableContent step={step} />
  }
  switch (step.type) {
    case BubbleStepType.TEXT: {
      return <TextBubbleContent step={step} />
    }
    case BubbleStepType.IMAGE: {
      return <ImageBubbleContent step={step} />
    }
    case BubbleStepType.VIDEO: {
      return <VideoBubbleContent step={step} />
    }
    case InputStepType.TEXT:
    case InputStepType.NUMBER:
    case InputStepType.EMAIL:
    case InputStepType.URL:
    case InputStepType.PHONE: {
      return (
        <PlaceholderContent placeholder={step.options.labels.placeholder} />
      )
    }
    case InputStepType.DATE: {
      return <Text color={'gray.500'}>Pick a date...</Text>
    }
    case InputStepType.CHOICE: {
      return <ButtonNodesList step={step} />
    }
    case LogicStepType.SET_VARIABLE: {
      return <SetVariableContent step={step} />
    }
    case LogicStepType.CONDITION: {
      return <ConditionContent step={step} />
    }
    case LogicStepType.REDIRECT: {
      return (
        <ConfigureContent
          label={
            step.options?.url ? `Redirect to ${step.options?.url}` : undefined
          }
        />
      )
    }
    case IntegrationStepType.GOOGLE_SHEETS: {
      return (
        <ConfigureContent
          label={
            step.options && 'action' in step.options
              ? step.options.action
              : undefined
          }
        />
      )
    }
    case IntegrationStepType.GOOGLE_ANALYTICS: {
      return (
        <ConfigureContent
          label={
            step.options?.action
              ? `Track "${step.options?.action}" `
              : undefined
          }
        />
      )
    }
    case IntegrationStepType.WEBHOOK: {
      return <WebhookContent step={step} />
    }
    case 'start': {
      return <Text>Start</Text>
    }
    default: {
      return <Text>No input</Text>
    }
  }
}
