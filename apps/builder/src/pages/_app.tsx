import { useEffect, useState } from 'react'
import { AppProps } from 'next/app'
import { SessionProvider, useSession } from 'next-auth/react'
import {
  ChakraProvider,
  createStandaloneToast,
  Flex,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { customTheme } from '@/lib/theme'
import { useRouterProgressBar } from '@/lib/routerProgressBar'
import '@/assets/styles/routerProgressBar.css'
import '@/assets/styles/plate.css'
import '@/assets/styles/resultsTable.css'
import '@/assets/styles/custom.css'
import '@/assets/styles/md.css'
import { UserProvider } from '@/features/account/UserProvider'
import { useRouter } from 'next/router'
import { SupportBubble } from '@/components/SupportBubble'
import { toTitleCase } from '@typebot.io/lib'
import { Plan } from '@typebot.io/prisma'
import { trpc } from '@/lib/trpc'
import { NewVersionPopup } from '@/components/NewVersionPopup'
import { TypebotProvider } from '@/features/editor/providers/TypebotProvider'
import { WorkspaceProvider } from '@/features/workspace/WorkspaceProvider'
import { isCloudProdInstance } from '@/helpers/isCloudProdInstance'
import { TolgeeProvider, useTolgeeSSR } from '@tolgee/react'
import { tolgee } from '@/lib/tolgee'
import { Toaster } from '@/components/Toaster'
import { handleIframeAuthentication } from '@/utils/iframe-auth'

const { ToastContainer, toast } = createStandaloneToast(customTheme)

// Component to handle iframe authentication before main app loads
const IframeAuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthReady, setIsAuthReady] = useState(false)

  const isEmbedded = router.query.embedded === 'true'

  useEffect(() => {
    if (!router.isReady) return

    if (isEmbedded && status !== 'loading') {
      if (!session && !isAuthReady) {
        // Listen for auth success
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'AUTH_SUCCESS' && event.data.user) {
            setIsAuthReady(true)
            window.removeEventListener('message', handleMessage)
          }
        }

        window.addEventListener('message', handleMessage)
        handleIframeAuthentication()

        return () => {
          window.removeEventListener('message', handleMessage)
        }
      } else if (session) {
        // Already authenticated
        setIsAuthReady(true)
        window.parent.postMessage(
          {
            type: 'AUTH_SUCCESS',
            user: session.user,
          },
          '*'
        )
      }
    } else if (!isEmbedded) {
      // Non-embedded mode, proceed immediately
      setIsAuthReady(true)
    }
  }, [router.isReady, isEmbedded, session, status, isAuthReady])

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
            : 'Authenticating with Cognito...'}
        </Text>
      </Flex>
    )
  }

  // Auth ready or non-embedded, render children
  return <>{children}</>
}

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter()
  const ssrTolgee = useTolgeeSSR(tolgee, router.locale)

  useRouterProgressBar()

  useEffect(() => {
    if (
      router.pathname.endsWith('/edit') ||
      router.pathname.endsWith('/analytics')
    ) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('disable-scroll-x-behavior')
    } else {
      document.body.style.overflow = 'auto'
      document.body.classList.remove('disable-scroll-x-behavior')
    }
  }, [router.pathname])

  useEffect(() => {
    const newPlan = router.query.stripe?.toString()
    if (newPlan === Plan.STARTER || newPlan === Plan.PRO)
      toast({
        position: 'top-right',
        status: 'success',
        title: 'Upgrade success!',
        description: `Workspace upgraded to ${toTitleCase(newPlan)} 🎉`,
      })
  }, [router.query.stripe])

  const typebotId = router.query.typebotId?.toString()

  return (
    <TolgeeProvider tolgee={ssrTolgee}>
      <ToastContainer />
      <ChakraProvider theme={customTheme}>
        <Toaster />
        <SessionProvider session={pageProps.session}>
          <IframeAuthWrapper>
            <UserProvider>
              <TypebotProvider typebotId={typebotId}>
                <WorkspaceProvider typebotId={typebotId}>
                  <Component {...pageProps} />
                  {!router.pathname.endsWith('edit') &&
                    isCloudProdInstance() && <SupportBubble />}
                  <NewVersionPopup />
                </WorkspaceProvider>
              </TypebotProvider>
            </UserProvider>
          </IframeAuthWrapper>
        </SessionProvider>
      </ChakraProvider>
    </TolgeeProvider>
  )
}

export default trpc.withTRPC(App)
