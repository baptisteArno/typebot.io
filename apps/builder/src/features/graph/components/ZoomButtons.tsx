import { Stack, IconButton } from '@chakra-ui/react'
import { PlusIcon, MinusIcon } from '@/components/icons'
import { headerHeight } from '@/features/editor'

type Props = {
  onZoomInClick: () => void
  onZoomOutClick: () => void
}
export const ZoomButtons = ({
  onZoomInClick: onZoomIn,
  onZoomOutClick: onZoomOut,
}: Props) => (
  <Stack
    pos="fixed"
    top={`calc(${headerHeight}px + 70px)`}
    right="40px"
    bgColor="white"
    rounded="md"
    zIndex={1}
    spacing="0"
    shadow="lg"
  >
    <IconButton
      icon={<PlusIcon />}
      aria-label={'Zoom in'}
      size="sm"
      onClick={onZoomIn}
      bgColor="white"
      borderBottomRadius={0}
    />
    <IconButton
      icon={<MinusIcon />}
      aria-label={'Zoom out'}
      size="sm"
      onClick={onZoomOut}
      bgColor="white"
      borderTopRadius={0}
    />
  </Stack>
)
