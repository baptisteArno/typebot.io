import { CloseIcon } from '@/components/icons'
import { useUser } from '@/features/account/hooks/useUser'
import {
  IconButton,
  SlideFade,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react'
import { useOnboardingDisclosure } from '../hooks/useOnboardingDisclosure'
import { onboardingVideos } from '../data'
import { YoutubeIframe } from './YoutubeIframe'

type Props = {
  type: keyof typeof onboardingVideos
}

export const VideoOnboardingFloatingWindow = ({ type }: Props) => {
  const { user, updateUser } = useUser()
  const { isOpen, onClose } = useOnboardingDisclosure({
    key: type,
    user,
    updateUser,
    defaultOpenDelay: 1000,
    blockDef: undefined,
  })
  const bgColor = useColorModeValue('white', 'gray.900')
  const closeButtonColorScheme = useColorModeValue('blackAlpha', 'gray')

  // if (!onboardingVideos[type]) return null
  return null

  return (
    <SlideFade
      in={isOpen}
      offsetY="20px"
      style={{
        position: 'fixed',
        bottom: '18px',
        right: '18px',
        zIndex: 42,
      }}
      unmountOnExit
    >
      <Flex
        p="5"
        bgColor={bgColor}
        borderWidth="1px"
        shadow="xl"
        rounded="md"
        aspectRatio="1.5"
        w="600px"
      >
        <YoutubeIframe id={onboardingVideos[type]!.youtubeId} />

        <IconButton
          icon={<CloseIcon />}
          aria-label={'Close'}
          pos="absolute"
          top="-3"
          right="-3"
          colorScheme={closeButtonColorScheme}
          size="sm"
          rounded="full"
          onClick={onClose}
        />
      </Flex>
    </SlideFade>
  )
}
