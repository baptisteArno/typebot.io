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

  console.log('Router state:', {
    isReady: router.isReady,
    query: router.query,
    embedded: router.query.embedded,
    isEmbedded,
  })

  useEffect(() => {
    // Wait for router to be ready before making decisions
    if (!router.isReady) return

    console.log('Router ready, isEmbedded:', isEmbedded)
    if (isEmbedded && status !== 'loading') {
      console.log("isEmbedded && status !== 'loading'")
      console.log({ session, iframeAuthComplete })
      if (!session && !iframeAuthComplete) {
        console.log('!session && !iframeAuthComplete')
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
    } else if (!isEmbedded) {
      console.log('nao era pra entrar aqui')
      // For non-embedded mode, don't interfere with normal auth
      setIframeAuthComplete(true)
    }
  }, [router.isReady, isEmbedded, session, status, iframeAuthComplete])

  // Wait for router to be ready
  if (!router.isReady) {
    return (
      <Flex height="100vh" justifyContent="center" alignItems="center">
        <Spinner />
        <Text ml={3}>Loading...</Text>
      </Flex>
    )
  }

  // For normal (non-embedded) access, let NextAuth handle loading state
  if (!isEmbedded) {
    return <EditorPage />
  }

  // Show loading while authenticating in iframe mode
  if (isEmbedded && !iframeAuthComplete) {
    return (
      <Flex
        h="100vh"
        justify="center"
        align="center"
        flexDirection="column"
        gap={4}
      >
        <Spinner size="lg" />
        <Text>
          {status === 'loading'
            ? 'Initializing...'
            : 'Authenticating with Cognito...'}
        </Text>
      </Flex>
    )
  }

  // Render the editor page (works for both embedded and non-embedded modes)
  return <EditorPage />
}
