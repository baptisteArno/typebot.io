import { StackProps, HStack } from '@chakra-ui/react'
import { StartStep, Step, StepIndices } from 'models'
import { StepIcon } from 'components/editor/StepsSideBar/StepIcon'
import { StepNodeContent } from './StepNodeContent/StepNodeContent/StepNodeContent'

export const StepNodeOverlay = ({
  step,
  indices,
  ...props
}: { step: Step | StartStep; indices: StepIndices } & StackProps) => {
  return (
    <HStack
      p="3"
      borderWidth="1px"
      rounded="lg"
      bgColor="white"
      cursor={'grab'}
      w="264px"
      pointerEvents="none"
      shadow="lg"
      {...props}
    >
      <StepIcon type={step.type} />
      <StepNodeContent step={step} indices={indices} />
    </HStack>
  )
}
