import { Box, Center, chakra, VisuallyHidden } from '@chakra-ui/react'
import React from 'react'

const Bar = chakra('span', {
  baseStyle: {
    display: 'block',
    pos: 'absolute',
    w: '1.25rem',
    h: '0.125rem',
    rounded: 'full',
    bg: 'currentcolor',
    mx: 'auto',
    insetStart: '0.125rem',
    transition: 'all 0.12s',
  },
})

const ToggleIcon = (props: { active: boolean }) => {
  const { active } = props
  return (
    <Box
      className="group"
      data-active={active ? '' : undefined}
      as="span"
      display="block"
      w="1.5rem"
      h="1.5rem"
      pos="relative"
      aria-hidden
      pointerEvents="none"
    >
      <Bar
        top="0.4375rem"
        _groupActive={{ top: '0.6875rem', transform: 'rotate(45deg)' }}
      />
      <Bar
        bottom="0.4375rem"
        _groupActive={{ bottom: '0.6875rem', transform: 'rotate(-45deg)' }}
      />
    </Box>
  )
}

interface ToggleButtonProps {
  isOpen: boolean
  onClick(): void
}

export const ToggleButton = (props: ToggleButtonProps) => {
  const { isOpen, onClick } = props
  return (
    <Center
      marginStart="-6"
      px="4"
      py="4"
      as="button"
      color="gray.400"
      _active={{ color: 'blue.600' }}
      onClick={onClick}
    >
      <ToggleIcon active={isOpen} />
      <VisuallyHidden>Toggle Menu</VisuallyHidden>
    </Center>
  )
}
