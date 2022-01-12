import { StackProps, HStack } from '@chakra-ui/react'
import { StartStep, Step } from 'models'
import { StepIcon } from 'components/board/StepTypesList/StepIcon'
import { StepNodeContent } from './StepNodeContent'

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
      <StepNodeContent step={step} />
    </HStack>
  )
}
