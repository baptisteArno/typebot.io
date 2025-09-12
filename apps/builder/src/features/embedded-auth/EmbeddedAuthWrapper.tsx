import { useEffect, useState, startTransition } from 'react'
import { useSession } from 'next-auth/react'
import { Flex, Spinner, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { handleEmbeddedAuthentication } from './embedded-auth'
import { getAllowedOrigin, isOriginAllowed } from './utils'

interface EmbeddedAuthWrapperProps {
  children: React.ReactNode
}

// Component to handle iframe authentication before main app loads
export const EmbeddedAuthWrapper = ({ children }: EmbeddedAuthWrapperProps) => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  const isEmbedded = router.query.embedded === 'true'

  // Ensure we're hydrated before making any decisions
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!router.isReady || !isHydrated) return

    if (isEmbedded && status !== 'loading') {
      if (!session && !isAuthReady) {
        // Listen for auth success
        const handleMessage = (event: MessageEvent) => {
          // Validate origin for security
          if (!isOriginAllowed(event.origin)) {
            console.warn(
              'Ignored message from unauthorized origin:',
              event.origin
            )
            return
          }

          if (event.data.type === 'AUTH_SUCCESS' && event.data.user) {
            startTransition(() => {
              setIsAuthReady(true)
            })
            window.removeEventListener('message', handleMessage)
          }
        }

        window.addEventListener('message', handleMessage)
        handleEmbeddedAuthentication()

        return () => {
          window.removeEventListener('message', handleMessage)
        }
      } else if (session) {
        // Already authenticated
        startTransition(() => {
          setIsAuthReady(true)
        })
        window.parent.postMessage(
          {
            type: 'AUTH_SUCCESS',
            user: session.user,
          },
          getAllowedOrigin()
        )
      }
    } else if (!isEmbedded) {
      // Non-embedded mode, proceed immediately
      startTransition(() => {
        setIsAuthReady(true)
      })
    }
  }, [router.isReady, isEmbedded, session, status, isAuthReady, isHydrated])

  // Don't render anything until hydration is complete
  if (!isHydrated) {
    return null
  }

  // Show loading while authenticating in iframe mode
  if (isEmbedded && !isAuthReady) {
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
            : 'Authenticating with CloudChat...'}
        </Text>
      </Flex>
    )
  }

  // Auth ready or non-embedded, render children
  return <>{children}</>
}
