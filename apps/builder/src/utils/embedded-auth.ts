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

export const handleEmbeddedAuthentication = async (): Promise<boolean> => {
  try {
    // Check if already authenticated via direct API call (works better with JWT in iframes)
    const session = await verifyAuthenticationStatus()

    if (session?.user) {
      return true
    }

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
            resolve(event.data.token)
          } else {
            reject(new Error('No auth token received'))
          }
        }
      }

      window.addEventListener('message', handleMessage)
    })

    // Use NextAuth signIn with the Cognito credentials provider
    const result = await signIn('cognito-iframe', {
      token,
      redirect: false,
    })

    if (result?.ok) {
      // Give NextAuth a moment to process the JWT and set cookies
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Verify session via direct API call (works better with JWT in iframes)
      const updatedSession = await verifyAuthenticationStatus()

      if (updatedSession?.user) {
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
        return false
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
  } catch (error) {
    console.error('Embedded authentication error:', error)
    // Notify parent of error
    window.parent.postMessage(
      {
        type: 'AUTH_ERROR',
        error: error instanceof Error ? error.message : 'Authentication error',
      },
      '*'
    )
    return false
  }
}
