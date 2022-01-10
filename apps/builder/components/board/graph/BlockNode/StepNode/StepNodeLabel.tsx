import { Flex, Text } from '@chakra-ui/react'
import { Step, StartStep, BubbleStepType, InputStepType } from 'models'

export const StepNodeLabel = (props: Step | StartStep) => {
  switch (props.type) {
    case BubbleStepType.TEXT: {
      return (
        <Flex
          flexDir={'column'}
          opacity={props.content.html === '' ? '0.5' : '1'}
          className="slate-html-container"
          dangerouslySetInnerHTML={{
            __html:
              props.content.html === ''
                ? `<p>Click to edit...</p>`
                : props.content.html,
          }}
        />
      )
    }
    case InputStepType.TEXT: {
      return (
        <Text color={'gray.500'}>
          {props.options?.labels?.placeholder ?? 'Type your answer...'}
        </Text>
      )
    }
    case InputStepType.NUMBER: {
      return (
        <Text color={'gray.500'}>
          {props.options?.labels?.placeholder ?? 'Type your answer...'}
        </Text>
      )
    }
    case InputStepType.EMAIL: {
      return (
        <Text color={'gray.500'}>
          {props.options?.labels?.placeholder ?? 'Type your email...'}
        </Text>
      )
    }
    case InputStepType.URL: {
      return (
        <Text color={'gray.500'}>
          {props.options?.labels?.placeholder ?? 'Type your URL...'}
        </Text>
      )
    }
    case InputStepType.DATE: {
      return (
        <Text color={'gray.500'}>
          {props.options?.labels?.from ?? 'Pick a date...'}
        </Text>
      )
    }
    case InputStepType.PHONE: {
      return (
        <Text color={'gray.500'}>
          {props.options?.labels?.placeholder ?? 'Your phone number...'}
        </Text>
      )
    }
    case 'start': {
      return <Text>{props.label}</Text>
    }
    default: {
      return <Text>No input</Text>
    }
  }
}
