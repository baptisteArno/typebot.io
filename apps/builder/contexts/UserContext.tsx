import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { isDefined, isNotDefined } from 'utils'
import { updateUser as updateUserInDb } from 'services/user'
import { useToast } from '@chakra-ui/react'
import { deepEqual } from 'fast-equals'
import { useCredentials } from 'services/credentials'
import { User } from 'db'
import { KeyedMutator } from 'swr'
import { Credentials } from 'models'

const userContext = createContext<{
  user?: User
  isLoading: boolean
  isSaving: boolean
  hasUnsavedChanges: boolean
  isOAuthProvider: boolean
  credentials: Credentials[]
  updateUser: (newUser: Partial<User>) => void
  saveUser: () => void
  mutateCredentials: KeyedMutator<{
    credentials: Credentials[]
  }>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const UserContext = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | undefined>()
  const { credentials, mutate } = useCredentials({
    userId: user?.id,
    onError: (error) =>
      toast({ title: error.name, description: error.message }),
  })
  const [isSaving, setIsSaving] = useState(false)
  const isOAuthProvider = useMemo(
    () => (session?.providerType as boolean | undefined) ?? false,
    [session?.providerType]
  )

  const hasUnsavedChanges = useMemo(
    () => !deepEqual(session?.user, user),
    [session?.user, user]
  )

  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  useEffect(() => {
    if (isDefined(user) || isNotDefined(session)) return
    setUser(session.user as User)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  useEffect(() => {
    if (!router.isReady) return
    if (status === 'loading') return
    if (status === 'unauthenticated' && !isSigningIn())
      router.replace('/signin')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router])

  const isSigningIn = () => ['/signin', '/register'].includes(router.pathname)

  const updateUser = (newUser: Partial<User>) => {
    if (isNotDefined(user)) return
    setUser({ ...user, ...newUser })
  }

  const saveUser = async () => {
    if (isNotDefined(user)) return
    setIsSaving(true)
    const { error } = await updateUserInDb(user.id, user)
    if (error) toast({ title: error.name, description: error.message })
    await refreshUser()
    setIsSaving(false)
  }

  return (
    <userContext.Provider
      value={{
        user,
        updateUser,
        saveUser,
        isSaving,
        isLoading: status === 'loading',
        hasUnsavedChanges,
        isOAuthProvider,
        credentials: credentials ?? [],
        mutateCredentials: mutate,
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

export const useUser = () => useContext(userContext)
