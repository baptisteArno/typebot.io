import React from 'react'
import { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { ChakraProvider } from '@chakra-ui/react'
import { customTheme } from 'libs/chakra'
import { useRouterProgressBar } from 'libs/routerProgressBar'
import 'assets/styles/routerProgressBar.css'
import 'assets/styles/plate.css'
import 'focus-visible/dist/focus-visible'

const App = ({ Component, pageProps }: AppProps) => {
  useRouterProgressBar()

  return (
    <ChakraProvider theme={customTheme}>
      <SessionProvider>
        <Component {...pageProps} />
      </SessionProvider>
    </ChakraProvider>
  )
}

export default App
