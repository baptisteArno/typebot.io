import {
  Box,
  BoxProps,
  Flex,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { EmojiOrImageIcon } from '@/components/EmojiOrImageIcon'
import { SniperInDashboard } from '@/features/dashboard/types'

type Props = {
  sniper: SniperInDashboard
} & BoxProps

export const SniperCardOverlay = ({ sniper, ...props }: Props) => {
  return (
    <Box
      display="flex"
      flexDir="column"
      variant="outline"
      justifyContent="center"
      w="225px"
      h="270px"
      whiteSpace="normal"
      transition="none"
      pointerEvents="none"
      borderWidth={1}
      rounded="md"
      bgColor={useColorModeValue('white', 'gray.700')}
      shadow="lg"
      opacity={0.7}
      {...props}
    >
      <VStack spacing={4}>
        <Flex
          rounded="full"
          justifyContent="center"
          alignItems="center"
          fontSize={'4xl'}
        >
          <EmojiOrImageIcon icon={sniper.icon} boxSize={'35px'} />
        </Flex>
        <Text>{sniper.name}</Text>
      </VStack>
    </Box>
  )
}
