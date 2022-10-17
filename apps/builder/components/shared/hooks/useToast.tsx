import { useToast as useChakraToast, UseToastOptions } from '@chakra-ui/react'
import { useCallback } from 'react'

export const useToast = () => {
  const toast = useChakraToast()

  const showToast = useCallback(
    ({ title, description, status = 'error', ...props }: UseToastOptions) => {
      toast({
        position: 'top-right',
        description,
        title,
        status,
        isClosable: true,
        ...props,
      })
    },
    [toast]
  )

  return { showToast }
}
