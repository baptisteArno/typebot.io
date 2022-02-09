import {
  Stack,
  Flex,
  Circle,
  Text,
  useColorModeValue,
  Heading,
  StackProps,
} from '@chakra-ui/react'
import * as React from 'react'

export interface ListItemProps extends StackProps {
  title: string
  circleActivated?: boolean
  subTitle?: string
  icon?: React.ReactElement
  isLastItem?: boolean
}

export const ListItem = (props: ListItemProps) => {
  const {
    title,
    subTitle,
    icon,
    isLastItem,
    children,
    circleActivated = true,
    ...stackProps
  } = props

  return (
    <Stack as="li" direction="row" spacing="4" {...stackProps}>
      <Flex direction="column" alignItems="center" aria-hidden="true">
        <Circle
          bg={circleActivated ? 'blue.500' : 'gray.500'}
          size="12"
          borderWidth="4px"
          borderColor={useColorModeValue('white', 'gray.800')}
          color={useColorModeValue('white', 'black')}
        >
          {icon}
        </Circle>
        {!isLastItem && <Flex flex="1" borderRightWidth="1px" mb="-12" />}
      </Flex>
      <Stack spacing="4" pt="1" flex="1">
        <Flex direction="column" mt="2">
          <Heading
            fontSize="2xl"
            fontWeight="bold"
            color={subTitle ? 'gray.600' : 'blue.400'}
          >
            {title}
          </Heading>
          {subTitle && (
            <Text fontSize="sm" color="gray.600">
              {subTitle}
            </Text>
          )}
        </Flex>
        <Flex>{children}</Flex>
      </Stack>
    </Stack>
  )
}
