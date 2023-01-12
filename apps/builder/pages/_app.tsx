import React, { useEffect } from 'react'
import { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { customTheme } from 'libs/theme'
import { useRouterProgressBar } from 'libs/routerProgressBar'
import 'assets/styles/routerProgressBar.css'
import 'assets/styles/plate.css'
import 'focus-visible/dist/focus-visible'
import 'assets/styles/submissionsTable.css'
import 'assets/styles/codeMirror.css'
import 'assets/styles/custom.css'
import { UserContext } from 'contexts/UserContext'
import { TypebotContext } from 'contexts/TypebotContext'
import { useRouter } from 'next/router'
import { KBarProvider } from 'kbar'
import { actions } from 'libs/kbar'
import { enableMocks, setupMockUser, setupEnvironment } from 'mocks'
import { SupportBubble } from 'components/shared/SupportBubble'
import { WorkspaceContext } from 'contexts/WorkspaceContext'

import { appWithTranslation } from 'next-i18next';

if (process.env.NEXT_PUBLIC_E2E_TEST === 'enabled') enableMocks()

const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => {
  useRouterProgressBar()
  const { query, pathname } = useRouter()

  useEffect(() => {
    pathname.endsWith('/edit')
      ? (document.body.style.overflow = 'hidden')
      : (document.body.style.overflow = 'auto')
  }, [pathname])

  useEffect(() => {
    setupMockUser()
    setupEnvironment()
  }, [])

  const typebotId = query.typebotId?.toString()
  return (
    <ChakraProvider theme={customTheme}>
      <KBarProvider actions={actions}>
        <UserContext>
          {typebotId ? (
            <TypebotContext typebotId={typebotId}>
              <WorkspaceContext>
                <Component {...pageProps} />
              </WorkspaceContext>
            </TypebotContext>
          ) : (
            <WorkspaceContext>
              <Component {...pageProps} />
            </WorkspaceContext>
          )}
        </UserContext>
      </KBarProvider>
    </ChakraProvider>
  )
}

export default appWithTranslation(App)
