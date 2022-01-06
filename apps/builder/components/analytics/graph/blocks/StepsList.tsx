import { Flex, Stack } from '@chakra-ui/react'
import { StepNodeOverlay } from 'components/board/graph/BlockNode/StepNode'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'

export const StepsList = ({ stepIds }: { stepIds: string[] }) => {
  const { typebot } = useTypebot()
  return (
    <Stack spacing={1} transition="none">
      <Flex h={'2px'} bgColor={'gray.400'} visibility={'hidden'} rounded="lg" />
      {typebot &&
        stepIds.map((stepId) => (
          <Stack key={stepId} spacing={1}>
            <StepNodeOverlay step={typebot?.steps.byId[stepId]} />
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
