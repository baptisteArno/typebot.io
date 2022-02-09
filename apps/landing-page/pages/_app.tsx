import React from 'react'
import 'assets/style.css'
import { ChakraProvider } from '@chakra-ui/react'
import 'focus-visible/dist/focus-visible'
import { theme } from '../lib/chakraTheme'
import { AppProps } from 'next/app'

const App = ({ Component, pageProps }: AppProps) => (
  <ChakraProvider theme={theme}>
    <Component {...pageProps} />
  </ChakraProvider>
)

export default App
