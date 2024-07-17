import { Flex, useColorModeValue } from '@chakra-ui/react'
import { onboardingVideos } from '../data'
import { YoutubeIframe } from './YoutubeIframe'

type Props = {
  type: keyof typeof onboardingVideos
}

export const VideoEmbed = ({ type }: Props) => {
  const bgColor = useColorModeValue('white', 'gray.900')

  if (!onboardingVideos[type]) return null

  return (
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
    </Flex>
  )
}
