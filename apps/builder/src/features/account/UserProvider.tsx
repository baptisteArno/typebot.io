import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { createContext, ReactNode, useEffect, useState } from 'react'
import { isDefined, isNotDefined } from '@typebot.io/lib'
import { User } from '@typebot.io/schemas'
import { setUser as setSentryUser } from '@sentry/nextjs'
import { useToast } from '@/hooks/useToast'
import { updateUserQuery } from './queries/updateUserQuery'
import { useDebouncedCallback } from 'use-debounce'
import { env } from '@typebot.io/env'
import { useColorMode } from '@chakra-ui/react'

export const userContext = createContext<{
  user?: User
  isLoading: boolean
  currentWorkspaceId?: string
  logOut: () => void
  updateUser: (newUser: Partial<User>) => void
}>({
  isLoading: false,
  logOut: () => {},
  updateUser: () => {},
})

const debounceTimeout = 1000

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | undefined>()
  const { showToast } = useToast()
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>()
  const { setColorMode } = useColorMode()

  useEffect(() => {
    const currentColorScheme = localStorage.getItem('chakra-ui-color-mode') as
      | 'light'
      | 'dark'
      | null
    if (!currentColorScheme) return
    const systemColorScheme = window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light'
    const userPrefersSystemMode =
      !user?.preferredAppAppearance || user.preferredAppAppearance === 'system'
    const computedColorMode = userPrefersSystemMode
      ? systemColorScheme
      : user?.preferredAppAppearance
    if (computedColorMode === currentColorScheme) return
    setColorMode(computedColorMode)
  }, [setColorMode, user?.preferredAppAppearance])

  useEffect(() => {
    if (isDefined(user) || isNotDefined(session)) return
    setCurrentWorkspaceId(
      localStorage.getItem('currentWorkspaceId') ?? undefined
    )
    const parsedUser = session.user as User
    setUser(parsedUser)

    if (parsedUser?.id) {
      setSentryUser({ id: parsedUser.id })
    }
  }, [session, user])

  useEffect(() => {
    if (!router.isReady) return
    if (status === 'loading') return
    const isSignInPath = ['/signin', '/register'].includes(router.pathname)
    const isPathPublicFriendly = /\/typebots\/.+\/(edit|theme|settings)/.test(
      router.pathname
    )
    if (isSignInPath || isPathPublicFriendly) return
    if (!user && status === 'unauthenticated')
      router.replace({
        pathname: '/signin',
        query: {
          redirectPath: router.asPath,
        },
      })
  }, [router, status, user])

  const updateUser = (updates: Partial<User>) => {
    if (isNotDefined(user)) return
    const newUser = { ...user, ...updates }
    setUser(newUser)
    saveUser(updates)
  }

  const saveUser = useDebouncedCallback(
    async (updates: Partial<User>) => {
      if (isNotDefined(user)) return
      const { error } = await updateUserQuery(user.id, updates)
      if (error) showToast({ title: error.name, description: error.message })
      await refreshUser()
    },
    env.NEXT_PUBLIC_E2E_TEST ? 0 : debounceTimeout
  )

  const logOut = () => {
    signOut()
    setUser(undefined)
  }

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
        logOut,
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
