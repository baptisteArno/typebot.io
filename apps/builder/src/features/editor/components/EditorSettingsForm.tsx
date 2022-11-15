import {
  Stack,
  Heading,
  HStack,
  Text,
  Radio,
  RadioGroup,
  VStack,
} from '@chakra-ui/react'
import { MouseIcon, LaptopIcon } from '@/components/icons'
import { useUser } from '@/features/account'
import { GraphNavigation } from 'db'
import React, { useEffect, useState } from 'react'

export const EditorSettingsForm = () => {
  const { user, saveUser } = useUser()
  const [value, setValue] = useState<string>(
    user?.graphNavigation ?? GraphNavigation.TRACKPAD
  )

  useEffect(() => {
    if (user?.graphNavigation === value) return
    saveUser({ graphNavigation: value as GraphNavigation }).then()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const options = [
    {
      value: GraphNavigation.MOUSE,
      label: 'Mouse',
      description:
        'Move by dragging the board and zoom in/out using the scroll wheel',
      icon: <MouseIcon boxSize="35px" />,
    },
    {
      value: GraphNavigation.TRACKPAD,
      label: 'Trackpad',
      description: 'Move the board using 2 fingers and zoom in/out by pinching',
      icon: <LaptopIcon boxSize="35px" />,
    },
  ]

  return (
    <Stack spacing={6}>
      <Heading size="md">Editor Navigation</Heading>
      <RadioGroup onChange={setValue} value={value}>
        <HStack spacing={4} w="full" align="stretch">
          {options.map((option) => (
            <VStack
              key={option.value}
              as="label"
              htmlFor={option.label}
              cursor="pointer"
              borderWidth="1px"
              borderRadius="md"
              w="full"
              p="6"
              spacing={6}
              justifyContent="space-between"
            >
              <VStack spacing={6}>
                {option.icon}
                <Stack>
                  <Text fontWeight="bold">{option.label}</Text>
                  <Text>{option.description}</Text>
                </Stack>
              </VStack>

              <Radio value={option.value} id={option.label} />
            </VStack>
          ))}
        </HStack>
      </RadioGroup>
    </Stack>
  )
}
