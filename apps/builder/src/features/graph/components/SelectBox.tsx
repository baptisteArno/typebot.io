import { Box } from '@chakra-ui/react'
import { Coordinates } from '../types'
import { headerHeight } from '@/features/editor/constants'

type Props = {
  origin: Coordinates
  dimension: {
    width: number
    height: number
  }
}

export const SelectBox = ({ origin, dimension }: Props) => (
  <Box
    pos="absolute"
    rounded="md"
    borderWidth={1}
    borderColor="orange.200"
    bgColor="rgba(0, 66, 218, 0.1)"
    style={{
      left: origin.x,
      top: origin.y - headerHeight,
      width: dimension.width,
      height: dimension.height,
      zIndex: 1000,
    }}
  />
)
