import { subDomain, environment, url, services } from '@octadesk-tech/services'

import Storage from '@octadesk-tech/storage'

import { config } from 'config/octadesk.config'

export const setupEnvironment = () => {
  if (!config.local) return

  const env = process.env.NODE_ENV_OCTADESK || 'qa'

  if (env === 'production') {
    environment.resolveEnvironment()
  }
}

export const login = async () => {
  try {
    const { data } = await services.nucleus
      .getClient({
        baseURL: process.env.LOGIN_URL,
      })
      .post('/nucleus-auth/auth', {
        userName: process.env.LOGIN_EMAIL,
        password: process.env.LOGIN_PASS,
        tenantId: process.env.LOGIN_TENANT,
      })

    return data
  } catch (ex) {
    throw new Error('Error in login: ' + ex)
  }
}

export const setupMockUser = async (): Promise<void> => {
  if (!config.local) return

  const env = process.env.NODE_ENV_OCTADESK || 'qa'

  if (env !== 'production') {
    const { apis, access_token, jwtoken, octaAuthenticated, userlogged } =
      await login()

    environment.setEnvironment(env)

    url.setAPIURLs(apis)

    Storage.setItem(
      'userLogged',
      (Storage as any)._decrypt(decodeURIComponent(userlogged))
    )

    const currentSubDomain = octaAuthenticated?.subDomain

    Storage.setItem('company', currentSubDomain)

    subDomain.setSubDomain(currentSubDomain)

    // Storage.setItem('status', {
    //   daysRemaining: 998,
    //   subDomain: currentSubDomain,
    //   isTrial: true,
    //   isAccountActivated: false,
    //   isValid: true,
    //   paymentInformation: { updatedTime: '0001-01-01T00:00:00', status: 0 },
    //   cycleType: 3,
    //   totalLicenses: 1,
    // })

    Storage.setItem('auth', {
      access_token,
      octaAuthenticated,
    })

    Storage.setItem('userToken', jwtoken)
  }
}
