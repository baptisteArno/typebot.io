import { FlexProps, Flex, useColorModeValue, Box } from '@chakra-ui/react'

export const ResizeHandle = (props: { isDark: boolean } & FlexProps) => {
  return (
    <Flex
      w="15px"
      h="50px"
      borderWidth={'1px'}
      bgColor={useColorModeValue('white', 'gray.800')}
      cursor={'col-resize'}
      justifyContent={'center'}
      align={'center'}
      borderRadius={'sm'}
      {...props}
    >
      <Box
        w="2px"
        bgColor={useColorModeValue('gray.300', 'gray.600')}
        h="70%"
        mr="0.5"
      />
      <Box
        w="2px"
        bgColor={useColorModeValue('gray.300', 'gray.600')}
        h="70%"
      />
    </Flex>
  )
}
