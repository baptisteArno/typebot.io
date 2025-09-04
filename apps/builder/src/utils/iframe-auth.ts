import { signIn, getSession } from 'next-auth/react'

export const handleIframeAuthentication = async (): Promise<boolean> => {
  try {
    // Check if already authenticated
    const session = await getSession()
    if (session?.user) {
      return true
    }

    // Check if we're in an iframe
    const isInIframe = window !== window.parent

    if (isInIframe) {
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

      // Use NextAuth signIn with the Cognito provider
      const result = await signIn('cognito-iframe', {
        token,
        redirect: false,
      })

      if (result?.ok) {
        // Try to get session multiple times with increasing delays
        let sessionAttempts = 0
        let updatedSession = null

        while (sessionAttempts < 5 && !updatedSession?.user) {
          await new Promise((resolve) =>
            setTimeout(resolve, 200 * (sessionAttempts + 1))
          )
          updatedSession = await getSession()
          sessionAttempts++
        }

        if (updatedSession?.user) {
          // Notify parent of success with actual user data
          window.parent.postMessage(
            {
              type: 'AUTH_SUCCESS',
              user: updatedSession.user,
            },
            '*'
          )
        } else {
          // Notify parent of success with basic confirmation
          window.parent.postMessage(
            {
              type: 'AUTH_SUCCESS',
              user: { authenticated: true },
            },
            '*'
          )
        }
        return true
      } else {
        console.error('Authentication failed:', result?.error)
        // Notify parent of error
        window.parent.postMessage(
          {
            type: 'AUTH_ERROR',
            error: result?.error || 'Authentication failed',
          },
          '*'
        )
        return false
      }
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
