//import { useSession } from 'next-auth/react'
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
import { updateUser as updateUserInDb } from 'services/user/user'
import { useToast } from '@chakra-ui/react'
import { dequal } from 'dequal'
import { FeatureFlags, FeatureFlagsProps, User } from 'model'
import { setUser as setSentryUser } from '@sentry/nextjs'
import { getAuthenticatedUser } from 'services/api/utils'
import Storage from '@octadesk-tech/storage'
import {
  getCompany,
  getCompanyFeatures,
  getStatus,
} from 'services/octadesk/featureFlags/featureFlags'

const userContext = createContext<{
  user?: User
  featureFlags: FeatureFlags | undefined
  companyFeatures?: {[key: string]: boolean}
  verifyFeatureToggle: (featureFlag: string) => boolean
  //   isLoading: boolean
  //   isSaving: boolean
  //   hasUnsavedChanges: boolean
  //   isOAuthProvider: boolean
  //   currentWorkspaceId?: string
  updateUser: (newUser: Partial<User>) => void
  saveUser: (newUser?: Partial<User>) => Promise<void>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const UserContext = ({ children }: { children: ReactNode }) => {
  //const router = useRouter()
  const mockUser = getAuthenticatedUser()
  const {
    data: { session },
    status,
  } = { data: { session: { user: mockUser } }, status: 'authenticated' } //useSession()
  const [user, setUser] = useState<User>()
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>()
  const [companyFeatureFlags, setCompanyFeatureFlags] = useState<{[key: string]: boolean}>()

  // const companyFeatures = ({ companyFeatures }) => companyFeatures

  // const companyModel = ({ companyModel }) => companyModel
  // const toast = useToast({
  //     position: 'top-right',
  //     status: 'error',
  // })
  //   const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>()

  //   const [isSaving, setIsSaving] = useState(false)
  //   const isOAuthProvider = false
  //  useMemo(
  //   // () => (session?.providerType as boolean | undefined) ?? false,
  //   // [session?.providerType]
  // )

  // const hasUnsavedChanges = useMemo(
  //     () => !dequal(session?.user, user),
  //     [session?.user, user]
  // )

  useEffect(() => {
    if (isDefined(user) || isNotDefined(session)) return
    // setCurrentWorkspaceId(
    //     localStorage.getItem('currentWorkspaceId') ?? undefined
    // )
    const parsedUser = session.user as User
    setUser(parsedUser)
    if (parsedUser?.id) setSentryUser({ id: parsedUser.id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const verifyFeatureToggle = (featureName: string): boolean => {
    if (!featureName) return false

    if (!featureFlags) return false

    const features = Object.values(featureFlags)
    const findFeature = features.find(feature => feature.code === featureName)

    if (!findFeature) {
      return false
    }

    return findFeature.active
  }

  const getCompanyModel = async (): Promise<void> => {
    const companyModel = await getCompany() 
    setCompanyFeatureFlags(companyModel.company?.features)
  }

  const getFeatures = async (): Promise<void> => {
    const featuresToggle = await getStatus()

    const features = Object.keys(featuresToggle)
      .map((code) => ({
        code,
        active: !!featuresToggle[code],
        baseLimit: null,
        maxLimit: null,
        qty: null,
      }))
      .filter((item) => item.code !== 'commerce-enabled')

    const {
      features: nucleusFeatures,
    }: { features: Array<FeatureFlagsProps> } = (await getStatus()) || {}

    const allFeatures: Array<FeatureFlagsProps> = []

    if (features) {
      allFeatures.push(...features)
    }

    if (nucleusFeatures) {
      allFeatures.push(...nucleusFeatures)
    }
    // const featureFlagsObject = allFeatures.reduce((acc, curr) => (curr.code = 'whatsapp-api', acc), { test: 1})
    const featureFlagsObject: FeatureFlags = Object.assign(
      {},
      allFeatures
    ) as any
    setFeatureFlags(featureFlagsObject)
  }

  useEffect(() => {
    if (!featureFlags) {
      getFeatures()
      getCompanyModel()
    }

    return () => {
      setFeatureFlags(undefined)
    }
  }, [])

  // useEffect(() => {
  //     if (!router.isReady) return
  //     if (status === 'loading') return
  //     if (!user && status === 'unauthenticated' && !isSigningIn())
  //         router.replace({
  //             pathname: '/signin',
  //             query:
  //                 router.pathname !== '/typebots'
  //                     ? {
  //                         redirectPath: router.asPath,
  //                     }
  //                     : undefined,
  //         })
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [status, router])

  //const isSigningIn = () => ['/signin', '/register'].includes(router.pathname)

  const updateUser = (newUser: Partial<User>) => {
    if (isNotDefined(user)) return
    setUser({ ...user, ...newUser })
  }

  const saveUser = async (newUser?: Partial<User>) => {
    if (isNotDefined(user)) return
    //setIsSaving(true)
    if (newUser) updateUser(newUser)
    //const { error } = await updateUserInDb(user.id, { ...user, ...newUser })
    //if (error) toast({ title: error.name, description: error.message })
    //await refreshUser()
    //setIsSaving(false)
  }

  return (
    <userContext.Provider
      value={{
        user,
        featureFlags,
        verifyFeatureToggle,
        companyFeatures: companyFeatureFlags,
        // isSaving: false,
        // isLoading: status === 'loading',
        // hasUnsavedChanges,
        // isOAuthProvider,
        // currentWorkspaceId,
        updateUser,
        saveUser,
      }}
    >
      {children}
    </userContext.Provider>
  )
}

// export const refreshUser = async () => {
//     await fetch('/api/auth/session?update')
//     reloadSession()
// }

// const reloadSession = () => {
//     const event = new Event('visibilitychange')
//     document.dispatchEvent(event)
// }

export const useUser = () => useContext(userContext)
