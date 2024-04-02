import { Flex } from '@chakra-ui/react'
import { StepTitle } from '../style'
import { Block } from 'models'
import { useGraph } from 'contexts/GraphContext'

const GroupsWithoutConnectionItem = ({ item }: { item: Block }) => {
  const { setGraphPosition } = useGraph()

  const focusOnField = () => {
    if (!item.graphCoordinates) return

    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const averageSizeCard = 315

    const calcX = centerX - averageSizeCard / 2 - item.graphCoordinates.x
    const calcY = centerY - averageSizeCard / 2 - item.graphCoordinates.y

    setGraphPosition({ x: calcX, y: calcY, scale: 1 })
  }

  return (
    <Flex
      key={item.id}
      paddingY="3"
      paddingX="4"
      rounded="8px"
      justifyContent="space-between"
      cursor={'pointer'}
      background="#F4F4F5"
      onClick={focusOnField}
    >
      <Flex alignItems="center" gap="2">
        <StepTitle>{item.title}</StepTitle>
      </Flex>
    </Flex>
  )
}

export default GroupsWithoutConnectionItem
