import React, { useEffect } from 'react'
import { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { ChakraProvider, createStandaloneToast } from '@chakra-ui/react'
import { customTheme } from 'libs/theme'
import { useRouterProgressBar } from 'libs/routerProgressBar'
import 'assets/styles/routerProgressBar.css'
import 'assets/styles/plate.css'
import 'assets/styles/submissionsTable.css'
import 'assets/styles/codeMirror.css'
import 'assets/styles/custom.css'
import { UserContext } from 'contexts/UserContext'
import { TypebotContext } from 'contexts/TypebotContext'
import { useRouter } from 'next/router'
import { KBarProvider } from 'kbar'
import { actions } from 'libs/kbar'
import { SupportBubble } from 'components/shared/SupportBubble'
import { WorkspaceContext } from 'contexts/WorkspaceContext'
import { toTitleCase } from 'utils'

const { ToastContainer, toast } = createStandaloneToast(customTheme)

const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => {
  useRouterProgressBar()
  const { query, pathname, isReady } = useRouter()

  useEffect(() => {
    pathname.endsWith('/edit')
      ? (document.body.style.overflow = 'hidden')
      : (document.body.style.overflow = 'auto')
  }, [pathname])

  useEffect(() => {
    displayStripeCallbackMessage(query.stripe?.toString(), toast)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady])

  const typebotId = query.typebotId?.toString()
  return (
    <>
      <ToastContainer />
      <ChakraProvider theme={customTheme}>
        <KBarProvider actions={actions}>
          <SessionProvider session={session}>
            <UserContext>
              {typebotId ? (
                <TypebotContext typebotId={typebotId}>
                  <WorkspaceContext>
                    <Component />
                    <SupportBubble />
                  </WorkspaceContext>
                </TypebotContext>
              ) : (
                <WorkspaceContext>
                  <Component {...pageProps} />
                  <SupportBubble />
                </WorkspaceContext>
              )}
            </UserContext>
          </SessionProvider>
        </KBarProvider>
      </ChakraProvider>
    </>
  )
}

const displayStripeCallbackMessage = (
  status: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toast: any
) => {
  if (status && ['pro', 'team'].includes(status)) {
    toast({
      position: 'bottom-right',
      status: 'success',
      title: 'Upgrade success!',
      description: `Workspace upgraded to ${toTitleCase(status)} 🎉`,
    })
  }
}

export default App
