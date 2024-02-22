import { colors } from '@/lib/theme'
import { useColorMode, useColorModeValue } from '@chakra-ui/react'
import { Toaster as SonnerToaster } from 'sonner'

export const Toaster = () => {
  const { colorMode } = useColorMode()
  const theme = useColorModeValue(
    {
      bg: undefined,
      actionBg: colors.blue[500],
      actionColor: undefined,
    },
    {
      bg: colors.gray[900],
      actionBg: colors.blue[400],
      actionColor: 'white',
    }
  )
  return (
    <SonnerToaster
      theme={colorMode}
      toastOptions={{
        actionButtonStyle: {
          backgroundColor: theme.actionBg,
          color: theme.actionColor,
        },
        style: {
          backgroundColor: theme.bg,
        },
      }}
    />
  )
}
