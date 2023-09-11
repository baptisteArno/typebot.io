import React, { useEffect, useState } from 'react'
import { AppProps } from 'next/app'
import { Box, ChakraProvider, Flex, Spinner } from '@chakra-ui/react'
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
import { WorkspaceContext } from 'contexts/WorkspaceContext'
import { appWithTranslation } from 'next-i18next'

if (process.env.NEXT_PUBLIC_E2E_TEST === 'enabled') enableMocks()

const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => {
  useRouterProgressBar()

  const { query, pathname } = useRouter()

  const [env] = useState(process.env.NODE_ENV_OCTADESK || 'qa')

  const [isLoaded, setIsLoaded] = useState(env === 'production')

  useEffect(() => {
    pathname.endsWith('/edit')
      ? (document.body.style.overflow = 'hidden')
      : (document.body.style.overflow = 'auto')

    setupEnvironment()

    setupMockUser().then(() => {
      setIsLoaded(true)
    })
  }, [pathname])

  const typebotId = query.typebotId?.toString()

  return (
    <ChakraProvider theme={customTheme}>
      <KBarProvider actions={actions}>
        {isLoaded ? (
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
        ) : (
          <Box
            w="100vw"
            h="100vh"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap="8px"
          >
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />

            <p>Aguarde, carregando...</p>
          </Box>
        )}
      </KBarProvider>
    </ChakraProvider>
  )
}

export default appWithTranslation(App)
