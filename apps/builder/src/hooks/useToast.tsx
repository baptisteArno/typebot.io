import { Toast, ToastProps } from '@/components/Toast'
import { useToast as useChakraToast } from '@chakra-ui/react'
import { useCallback } from 'react'

export const useToast = () => {
  const toast = useChakraToast()

  const showToast = useCallback(
    ({
      title,
      description,
      status = 'error',
      icon,
      details,
      primaryButton,
      secondaryButton,
    }: Omit<ToastProps, 'onClose'>) => {
      toast({
        position: 'top-right',
        duration: details && status === 'error' ? null : undefined,
        render: ({ onClose }) => (
          <Toast
            title={title}
            description={description}
            status={status}
            icon={icon}
            details={details}
            onClose={onClose}
            primaryButton={primaryButton}
            secondaryButton={secondaryButton}
          />
        ),
      })
    },
    [toast]
  )

  return { showToast }
}
