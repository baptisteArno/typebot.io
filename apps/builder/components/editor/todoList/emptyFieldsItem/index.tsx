import { Flex } from '@chakra-ui/react'
import { StepIcon } from 'components/editor/StepsSideBar/StepIcon'
import { StepTitle } from '../style'
import { StepTypeLabel } from 'components/editor/StepsSideBar/StepTypeLabel'
import { colors } from 'libs/theme'
import { useGraph } from 'contexts/GraphContext'
import { EmptyFields } from 'hooks/EmptyFields/useEmptyFields'
import { useTypebot } from 'contexts/TypebotContext'

const EmptyFieldsItem = ({ item }: { item: EmptyFields }) => {
  const { setGraphPosition } = useGraph()
  const { typebot } = useTypebot()

  const focusOnField = () => {
    const graphCoordinates = typebot?.blocks.find((b) =>
      b.steps.find((s) => s.id === item.step.id)
    )?.graphCoordinates

    if (!graphCoordinates) return
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const averageSizeCard = 315

    const calcX = centerX - averageSizeCard / 2 - graphCoordinates.x
    const calcY = centerY - averageSizeCard / 2 - graphCoordinates.y

    setGraphPosition({ x: calcX, y: calcY, scale: 1 })
  }
  return (
    <Flex
      key={item?.step?.id}
      paddingY="3"
      paddingX="4"
      rounded="8px"
      justifyContent="space-between"
      background="#F4F4F5"
      cursor={'pointer'}
      onClick={focusOnField}
    >
      <Flex alignItems="center" gap="2">
        <StepIcon color={colors.orange[300]} type={item?.step?.type} />
        <StepTitle>
          <StepTypeLabel type={item?.step?.type} />
        </StepTitle>
      </Flex>
    </Flex>
  )
}

export default EmptyFieldsItem
