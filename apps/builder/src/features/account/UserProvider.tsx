import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { createContext, ReactNode, useEffect, useState } from 'react'
import { env, isDefined, isNotDefined } from '@typebot.io/lib'
import { User } from '@typebot.io/prisma'
import { setUser as setSentryUser } from '@sentry/nextjs'
import { useToast } from '@/hooks/useToast'
import { updateUserQuery } from './queries/updateUserQuery'
import { useDebouncedCallback } from 'use-debounce'

export const userContext = createContext<{
  user?: User
  isLoading: boolean
  currentWorkspaceId?: string
  updateUser: (newUser: Partial<User>) => void
}>({
  isLoading: false,
  updateUser: () => {
    console.log('updateUser not implemented')
  },
})

const debounceTimeout = 1000

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | undefined>()
  const { showToast } = useToast()
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>()

  useEffect(() => {
    if (isDefined(user) || isNotDefined(session)) return
    setCurrentWorkspaceId(
      localStorage.getItem('currentWorkspaceId') ?? undefined
    )
    const parsedUser = session.user as User
    setUser(parsedUser)
    if (parsedUser?.id) setSentryUser({ id: parsedUser.id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  useEffect(() => {
    if (!router.isReady) return
    if (status === 'loading') return
    if (!user && status === 'unauthenticated' && !isSigningIn())
      router.replace({
        pathname: '/signin',
        query:
          router.pathname !== '/typebots'
            ? {
                redirectPath: router.asPath,
              }
            : undefined,
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router])

  const isSigningIn = () => ['/signin', '/register'].includes(router.pathname)

  const updateUser = (updates: Partial<User>) => {
    if (isNotDefined(user)) return
    const newUser = { ...user, ...updates }
    setUser(newUser)
    saveUser(newUser)
  }

  const saveUser = useDebouncedCallback(
    async (newUser?: Partial<User>) => {
      if (isNotDefined(user)) return
      const { error } = await updateUserQuery(user.id, { ...user, ...newUser })
      if (error) showToast({ title: error.name, description: error.message })
      await refreshUser()
    },
    env('E2E_TEST') === 'true' ? 0 : debounceTimeout
  )

  useEffect(() => {
    return () => {
      saveUser.flush()
    }
  }, [saveUser])

  return (
    <userContext.Provider
      value={{
        user,
        isLoading: status === 'loading',
        currentWorkspaceId,
        updateUser,
      }}
    >
      {children}
    </userContext.Provider>
  )
}

export const refreshUser = async () => {
  await fetch('/api/auth/session?update')
  reloadSession()
}

const reloadSession = () => {
  const event = new Event('visibilitychange')
  document.dispatchEvent(event)
}
