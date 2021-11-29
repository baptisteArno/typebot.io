import { TypebotLogo } from 'assets/logos'
import { Spinner, VStack } from '@chakra-ui/react'

export const LoadingPage = () => (
  <div className="flex h-screen items-center justify-center">
    <VStack spacing={6}>
      <TypebotLogo boxSize="80px" />
      <Spinner />
    </VStack>
  </div>
)
