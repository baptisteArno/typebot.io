import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

interface IUserContextData {
  user?: User
  featureFlags: FeatureFlags | undefined
  companyFeatures?: { [key: string]: boolean }
  verifyFeatureToggle: (featureFlag: string) => boolean
  updateUser: (newUser: Partial<User>) => void
  saveUser: (newUser?: Partial<User>) => Promise<void>
}

const userContext = createContext<IUserContextData>({} as IUserContextData)

export const UserContext = ({ children }: { children: ReactNode }) => {
  const mockUser = getAuthenticatedUser()

  const {
    data: { session },
    status,
  } = { data: { session: { user: mockUser } }, status: 'authenticated' }

  const [user, setUser] = useState<User>()

  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>()

  const [companyFeatureFlags, setCompanyFeatureFlags] = useState<{
    [key: string]: boolean
  }>()

  useEffect(() => {
    if (isDefined(user) || isNotDefined(session)) return

    const parsedUser = session.user as User

    setUser(parsedUser)

    if (parsedUser?.id) setSentryUser({ id: parsedUser.id })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  useEffect(() => {
    if (!featureFlags) {
      getFeatures()
      getCompanyModel()
    }

    return () => {
      setFeatureFlags(undefined)
    }
  }, [])

  const verifyFeatureToggle = useCallback(
    (featureName: string): boolean => {
      if (!featureName) return false

      if (!featureFlags) return false

      const features = Object.values(featureFlags)

      const findFeature = features.find(
        (feature) => feature.code === featureName
      )

      if (!findFeature) {
        return false
      }

      return findFeature.active
    },
    [featureFlags]
  )

  const getCompanyModel = async (): Promise<void> => {
    const companyModel = await getCompany()

    setCompanyFeatureFlags(companyModel.company?.features)
  }

  const getFeatures = async (): Promise<void> => {
    const { featureFlags }: { featureFlags: Array<FeatureFlagsProps> } =
      (await getStatus()) || {}

    const featureFlagsObject: FeatureFlags = Object.assign(
      {},
      featureFlags
    ) as any

    setFeatureFlags(featureFlagsObject)
  }

  const updateUser = useCallback(
    (newUser: Partial<User>) => {
      if (isNotDefined(user)) return

      setUser({ ...user, ...newUser })
    },
    [user]
  )

  const saveUser = useCallback(
    async (newUser?: Partial<User>) => {
      if (isNotDefined(user)) return

      if (newUser) updateUser(newUser)
    },
    [user, updateUser]
  )

  const value = useMemo(
    () => ({
      user,
      featureFlags,
      verifyFeatureToggle,
      companyFeatures: companyFeatureFlags,
      updateUser,
      saveUser,
    }),
    [
      user,
      featureFlags,
      verifyFeatureToggle,
      companyFeatureFlags,
      updateUser,
      saveUser,
    ]
  )

  return <userContext.Provider value={value}>{children}</userContext.Provider>
}

export const useUser = (): IUserContextData => {
  const context = useContext(userContext)

  if (!context) {
    throw new Error('useUser must be used within an userProvider')
  }

  return context
}
