import React, { useEffect } from 'react'
import 'assets/style.css'
import { ChakraProvider } from '@chakra-ui/react'
import 'focus-visible/dist/focus-visible'
import { theme } from '../lib/chakraTheme'
import { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/react'
import AOS from 'aos'
import 'aos/dist/aos.css'

const App = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    AOS.init({
      easing: 'ease',
      duration: 1000,
      once: true,
    })
  }, [])

  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
      <Analytics />
    </ChakraProvider>
  )
}

export default App
