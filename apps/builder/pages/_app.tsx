import React from 'react'
import { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { ChakraProvider } from '@chakra-ui/react'
import { customTheme } from 'libs/chakra'
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

const App = ({ Component, pageProps }: AppProps) => {
  useRouterProgressBar()
  const { query } = useRouter()

  return (
    <ChakraProvider theme={customTheme}>
      <KBarProvider actions={actions}>
        <SessionProvider>
          <UserContext>
            <TypebotContext typebotId={query.typebotId?.toString()}>
              <Component {...pageProps} />
            </TypebotContext>
          </UserContext>
        </SessionProvider>
      </KBarProvider>
    </ChakraProvider>
  )
}

export default App
