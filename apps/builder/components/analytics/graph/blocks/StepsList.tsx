import { Flex, Stack } from '@chakra-ui/react'
import { StartStep, Step } from 'bot-engine'
import { StepNodeOverlay } from 'components/board/graph/BlockNode/StepNode'

export const StepsList = ({
  steps,
}: {
  blockId: string
  steps: Step[] | [StartStep]
}) => {
  return (
    <Stack spacing={1} transition="none">
      <Flex h={'2px'} bgColor={'gray.400'} visibility={'hidden'} rounded="lg" />
      {steps.map((step) => (
        <Stack key={step.id} spacing={1}>
          <StepNodeOverlay key={step.id} step={step} />
          <Flex
            h={'2px'}
            bgColor={'gray.400'}
            visibility={'hidden'}
            rounded="lg"
          />
        </Stack>
      ))}
    </Stack>
  )
}
