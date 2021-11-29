import Router from 'next/router'
import NProgress from 'nprogress'
import { useEffect } from 'react'

export const useRouterProgressBar = () =>
  useEffect(() => {
    if (typeof window !== 'undefined') {
      NProgress.configure({ showSpinner: false })

      Router.events.on('routeChangeStart', () => {
        NProgress.start()
      })

      Router.events.on('routeChangeComplete', () => {
        NProgress.done()
      })

      Router.events.on('routeChangeError', () => {
        NProgress.done()
      })
    }
  }, [])
