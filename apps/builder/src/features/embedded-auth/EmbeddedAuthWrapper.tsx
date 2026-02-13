import React, {
  useEffect,
  useState,
  startTransition,
  PropsWithChildren,
} from 'react'
import { useSession } from 'next-auth/react'
import { Flex, Spinner, Text } from '@chakra-ui/react'
import { handleEmbeddedAuthentication } from './embedded-auth'
import { getAllowedOrigin, isOriginAllowed } from './utils'
import { useSearchParams } from 'next/navigation'

export const EmbeddedAuthWrapper = ({ children }: PropsWithChildren) => {
  const { data: session, status } = useSession()

  const searchParams = useSearchParams()
  const [isAuthReady, setIsAuthReady] = useState(false)

  useEffect(() => {
    if (!searchParams || isAuthReady) return

    if (!searchParams) return
    if (!searchParams.get('embedded')) {
      setIsAuthReady(true)
      return
    }

    if (status !== 'loading') {
      if (session) {
        setIsAuthReady(true)
        window.parent.postMessage(
          {
            type: 'AUTH_SUCCESS',
            user: session.user,
          },
          getAllowedOrigin()
        )

        return
      }

      if (!session) {
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
      }
    }
  }, [searchParams, session, status, isAuthReady])

  // Show loading while authenticating in iframe mode
  if (!searchParams || !isAuthReady) {
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
