import { EditorPage } from '@/features/editor/components/EditorPage'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { handleIframeAuthentication } from '@/utils/iframe-auth'
import { Flex, Spinner, Text } from '@chakra-ui/react'

export default function Page() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const isEmbedded = router.query.embedded === 'true'
  const [iframeAuthComplete, setIframeAuthComplete] = useState(false)

  useEffect(() => {
    if (isEmbedded && status !== 'loading') {
      if (!session && !iframeAuthComplete) {
        // Listen for auth success from iframe-auth
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'AUTH_SUCCESS' && event.data.user) {
            setIframeAuthComplete(true)
            // Remove the listener
            window.removeEventListener('message', handleMessage)
          }
        }

        window.addEventListener('message', handleMessage)
        handleIframeAuthentication()

        return () => {
          window.removeEventListener('message', handleMessage)
        }
      } else if (session) {
        // User is already authenticated via NextAuth
        setIframeAuthComplete(true)
        window.parent.postMessage(
          {
            type: 'AUTH_SUCCESS',
            user: session.user,
          },
          '*'
        )
      }
    }
  }, [isEmbedded, session, status, iframeAuthComplete])

  // Show loading while authenticating in iframe mode
  if (isEmbedded && !iframeAuthComplete && status === 'loading') {
    return (
      <Flex
        h="100vh"
        justify="center"
        align="center"
        flexDirection="column"
        gap={4}
      >
        <Spinner size="lg" />
        <Text>Initializing...</Text>
      </Flex>
    )
  }

  // Show loading while authenticating in iframe mode without session
  if (isEmbedded && !iframeAuthComplete && !session && status !== 'loading') {
    return (
      <Flex
        h="100vh"
        justify="center"
        align="center"
        flexDirection="column"
        gap={4}
      >
        <Spinner size="lg" />
        <Text>Authenticating with Cognito...</Text>
      </Flex>
    )
  }

  // For iframe mode, render the editor regardless of NextAuth session status
  // since we have our own authentication via Cognito
  if (isEmbedded && iframeAuthComplete) {
    return <EditorPage />
  }

  // For non-iframe mode, use normal NextAuth session check
  if (!isEmbedded && !session && status === 'loading') {
    return (
      <Flex
        h="100vh"
        justify="center"
        align="center"
        flexDirection="column"
        gap={4}
      >
        <Spinner size="lg" />
        <Text>Loading...</Text>
      </Flex>
    )
  }

  return <EditorPage />
}
