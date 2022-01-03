import { StackProps, HStack } from '@chakra-ui/react'
import { StartStep, Step } from 'bot-engine'
import { StepIcon } from 'components/board/StepTypesList/StepIcon'
import { StepContent } from './StepContent'

export const StepNodeOverlay = ({
  step,
  ...props
}: { step: Step | StartStep } & StackProps) => {
  return (
    <HStack
      p="3"
      borderWidth="1px"
      rounded="lg"
      bgColor="white"
      cursor={'grab'}
      w="264px"
      pointerEvents="none"
      {...props}
    >
      <StepIcon type={step.type} />
      <StepContent {...step} />
    </HStack>
  )
}
