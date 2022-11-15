import { Box, BoxProps, Flex, Text, VStack } from '@chakra-ui/react'
import { GlobeIcon, ToolIcon } from '@/components/icons'
import { TypebotInDashboard } from '@/features/dashboard'

type Props = {
  typebot: TypebotInDashboard
} & BoxProps

export const TypebotCardOverlay = ({ typebot, ...props }: Props) => {
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
      bgColor="white"
      shadow="lg"
      opacity={0.7}
      {...props}
    >
      <VStack spacing={4}>
        <Flex
          boxSize="45px"
          rounded="full"
          justifyContent="center"
          alignItems="center"
          bgColor={typebot.publishedTypebotId ? 'blue.500' : 'gray.400'}
          color="white"
        >
          {typebot.publishedTypebotId ? (
            <GlobeIcon fill="white" fontSize="20px" />
          ) : (
            <ToolIcon fill="white" fontSize="20px" />
          )}
        </Flex>
        <Text>{typebot.name}</Text>
      </VStack>
    </Box>
  )
}
