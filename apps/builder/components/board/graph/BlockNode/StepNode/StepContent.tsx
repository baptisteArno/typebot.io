import { Flex, Text } from '@chakra-ui/react'
import { Step, StartStep, StepType } from 'models'

export const StepContent = (props: Step | StartStep) => {
  switch (props.type) {
    case StepType.TEXT: {
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
        ></Flex>
      )
    }
    case StepType.TEXT_INPUT: {
      return <Text color={'gray.500'}>Type your answer...</Text>
    }
    case StepType.START: {
      return <Text>{props.label}</Text>
    }
    default: {
      return <Text>No input</Text>
    }
  }
}
