import { signIn } from 'next-auth/react'

interface SessionResponse {
  user?: {
    id: string
    email: string
    name?: string
    image?: string
    [key: string]: unknown
  }
  expires?: string
}

// Helper function to verify authentication via API call
const verifyAuthenticationStatus =
  async (): Promise<SessionResponse | null> => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'same-origin',
      })

      if (response.ok) {
        const session = await response.json()
        return session?.user ? session : null
      }
      return null
    } catch (error) {
      console.error('Failed to verify authentication:', error)
      return null
    }
  }

export const handleIframeAuthentication = async (): Promise<boolean> => {
  console.log('Starting iframe authentication')
  try {
    // Check if already authenticated via direct API call (works better with JWT in iframes)
    const session = await verifyAuthenticationStatus()
    console.log('Session from API call:', session)

    if (session?.user) {
      console.log('Already authenticated')
      return true
    }

    // Check if we're in an iframe
    const isInIframe = window !== window.parent

    if (isInIframe) {
      console.log('In iframe, requesting auth token from parent')
      // Request token from parent
      window.parent.postMessage({ type: 'REQUEST_AUTH_TOKEN' }, '*')

      // Wait for token response
      const token = await new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Auth token request timeout'))
        }, 10000) // 10 second timeout

        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'AUTH_TOKEN_RESPONSE') {
            clearTimeout(timeout)
            window.removeEventListener('message', handleMessage)

            if (event.data.token) {
              console.log('Auth token received from parent')
              resolve(event.data.token)
            } else {
              reject(new Error('No auth token received'))
            }
          }
        }

        window.addEventListener('message', handleMessage)
      })

      console.log('Calling signIn with cognito-iframe provider')

      // Use NextAuth signIn with the Cognito credentials provider
      const result = await signIn('cognito-iframe', {
        token,
        redirect: false,
      })

      console.log('SignIn result:', result)

      if (result?.ok) {
        console.log('SignIn successful, verifying authentication...')

        // Give NextAuth a moment to process the JWT and set cookies
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Verify session via direct API call (works better with JWT in iframes)
        const updatedSession = await verifyAuthenticationStatus()
        console.log('Final session verification:', updatedSession)

        if (updatedSession?.user) {
          console.log('Authentication successful, notifying parent')
          // Notify parent of success
          window.parent.postMessage(
            {
              type: 'AUTH_SUCCESS',
              user: updatedSession.user,
            },
            '*'
          )
          return true
        } else {
          console.warn(
            'Authentication appeared successful but session not available'
          )
          // This might happen in iframe context with cookie restrictions
          // We'll trust the signIn result and notify with minimal info
          window.parent.postMessage(
            {
              type: 'AUTH_SUCCESS',
              user: { authenticated: true, provider: 'cognito-iframe' },
            },
            '*'
          )
          return true
        }
      }

      console.error('Authentication failed:', result?.error)
      window.parent.postMessage(
        {
          type: 'AUTH_ERROR',
          error: result?.error || 'Authentication failed',
        },
        '*'
      )
      return false
    }

    return false
  } catch (error) {
    console.error('Iframe authentication error:', error)
    // Notify parent of error if in iframe
    if (window !== window.parent) {
      window.parent.postMessage(
        {
          type: 'AUTH_ERROR',
          error:
            error instanceof Error ? error.message : 'Authentication error',
        },
        '*'
      )
    }
    return false
  }
}
