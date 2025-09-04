import { DashboardPage } from '@/features/dashboard/components/DashboardPage'
import { GetServerSidePropsContext } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { handleIframeAuthentication } from '@/utils/iframe-auth'
import { Flex, Spinner, Text } from '@chakra-ui/react'

export default function Page() {
  const { status } = useSession()
  const router = useRouter()
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    // Check if we're in an iframe and need authentication
    const isInIframe = window !== window.parent
    const isEmbedded = router.query.embedded === 'true'

    if ((isInIframe || isEmbedded) && status === 'unauthenticated') {
      setIsAuthenticating(true)
      handleIframeAuthentication()
        .then((success) => {
          if (!success) {
            setAuthError('Failed to authenticate via iframe')
          }
          setIsAuthenticating(false)
        })
        .catch((error) => {
          console.error('Iframe authentication error:', error)
          setAuthError(error.message || 'Authentication failed')
          setIsAuthenticating(false)
        })
    }
  }, [status, router.query.embedded])

  // Show loading state during iframe authentication
  if (isAuthenticating) {
    return (
      <Flex direction="column" justify="center" align="center" h="100vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text mt={4} fontSize="lg" color="gray.600">
          Authenticating...
        </Text>
        <Text mt={2} fontSize="sm" color="gray.500">
          Verifying your credentials
        </Text>
      </Flex>
    )
  }

  // Show error state if iframe authentication failed
  if (authError) {
    return (
      <Flex direction="column" justify="center" align="center" h="100vh">
        <Text fontSize="lg" color="red.500" mb={4}>
          Authentication Failed
        </Text>
        <Text fontSize="sm" color="gray.600" textAlign="center" maxW="md">
          {authError}
        </Text>
      </Flex>
    )
  }

  return <DashboardPage />
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const callbackUrl = context.query.callbackUrl?.toString()
  const redirectPath =
    context.query.redirectPath?.toString() ??
    (callbackUrl
      ? new URL(callbackUrl).searchParams.get('redirectPath')
      : undefined)
  return redirectPath
    ? {
        redirect: {
          permanent: false,
          destination: redirectPath,
        },
      }
    : { props: {} }
}
