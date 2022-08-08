import { useToast as useChakraToast, UseToastOptions } from '@chakra-ui/react'

export const useToast = () => {
  const toast = useChakraToast()

  const showToast = ({
    title,
    description,
    status = 'error',
  }: UseToastOptions) => {
    toast({
      position: 'bottom-right',
      description,
      title,
      status,
    })
  }

  return { showToast }
}
