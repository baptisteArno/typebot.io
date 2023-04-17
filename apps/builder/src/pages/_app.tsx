import { useEffect } from 'react'
import { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { ChakraProvider, createStandaloneToast } from '@chakra-ui/react'
import { customTheme } from '@/lib/theme'
import { useRouterProgressBar } from '@/lib/routerProgressBar'
import '@/assets/styles/routerProgressBar.css'
import '@/assets/styles/plate.css'
import '@/assets/styles/resultsTable.css'
import '@/assets/styles/custom.css'
import { UserProvider } from '@/features/account/UserProvider'
import { useRouter } from 'next/router'
import { SupportBubble } from '@/components/SupportBubble'
import { toTitleCase } from '@typebot.io/lib'
import { Plan } from '@typebot.io/prisma'
import { trpc } from '@/lib/trpc'
import { NewVersionPopup } from '@/components/NewVersionPopup'
import { I18nProvider } from '@/locales'
import { TypebotProvider } from '@/features/editor/providers/TypebotProvider'
import { WorkspaceProvider } from '@/features/workspace/WorkspaceProvider'

const { ToastContainer, toast } = createStandaloneToast(customTheme)

const App = ({ Component, pageProps }: AppProps) => {
  useRouterProgressBar()
  const { query, pathname } = useRouter()

  useEffect(() => {
    if (pathname.endsWith('/edit')) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('disable-scroll-x-behavior')
    } else {
      document.body.style.overflow = 'auto'
      document.body.classList.remove('disable-scroll-x-behavior')
    }
  }, [pathname])

  useEffect(() => {
    const newPlan = query.stripe?.toString()
    if (newPlan === Plan.STARTER || newPlan === Plan.PRO)
      toast({
        position: 'top-right',
        status: 'success',
        title: 'Upgrade success!',
        description: `Workspace upgraded to ${toTitleCase(newPlan)} 🎉`,
      })
  }, [query.stripe])

  const typebotId = query.typebotId?.toString()

  return (
    <>
      <ToastContainer />
      <I18nProvider locale={pageProps.locale}>
        <ChakraProvider theme={customTheme}>
          <SessionProvider session={pageProps.session}>
            <UserProvider>
              <TypebotProvider typebotId={typebotId}>
                <WorkspaceProvider typebotId={typebotId}>
                  <Component {...pageProps} />
                  <SupportBubble />
                  <NewVersionPopup />
                </WorkspaceProvider>
              </TypebotProvider>
            </UserProvider>
          </SessionProvider>
        </ChakraProvider>
      </I18nProvider>
    </>
  )
}

export default trpc.withTRPC(App)
