import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { isDefined, isNotDefined } from 'utils'
import { FeatureFlags, FeatureFlagsProps, User } from 'model'
import { setUser as setSentryUser } from '@sentry/nextjs'
import { getAuthenticatedUser } from 'services/api/utils'
import {
  getCompany,
  getStatus,
} from 'services/octadesk/featureFlags/featureFlags'

const userContext = createContext<{
  user?: User
  featureFlags: FeatureFlags | undefined
  companyFeatures?: {[key: string]: boolean}
  verifyFeatureToggle: (featureFlag: string) => boolean
  updateUser: (newUser: Partial<User>) => void
  saveUser: (newUser?: Partial<User>) => Promise<void>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const UserContext = ({ children }: { children: ReactNode }) => {
  const mockUser = getAuthenticatedUser()
  const {
    data: { session },
    status,
  } = { data: { session: { user: mockUser } }, status: 'authenticated' } //useSession()
  const [user, setUser] = useState<User>()
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>()
  const [companyFeatureFlags, setCompanyFeatureFlags] = useState<{[key: string]: boolean}>()

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
    const {
      featureFlags,
    }: { featureFlags: Array<FeatureFlagsProps> } = (await getStatus()) || {}

    const featureFlagsObject: FeatureFlags = Object.assign(
      {},
      featureFlags
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

  const updateUser = (newUser: Partial<User>) => {
    if (isNotDefined(user)) return
    setUser({ ...user, ...newUser })
  }

  const saveUser = async (newUser?: Partial<User>) => {
    if (isNotDefined(user)) return

    if (newUser) updateUser(newUser)
  }

  return (
    <userContext.Provider
      value={{
        user,
        featureFlags,
        verifyFeatureToggle,
        companyFeatures: companyFeatureFlags,
        updateUser,
        saveUser,
      }}
    >
      {children}
    </userContext.Provider>
  )
}

export const useUser = () => useContext(userContext)
