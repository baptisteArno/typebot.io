import { SmtpCredentials } from 'models'
import { sendRequest } from 'utils'

export const testSmtpConfig = (smtpData: SmtpCredentials['data'], to: string) =>
  sendRequest({
    method: 'POST',
    url: '/api/integrations/email/test-config',
    body: {
      ...smtpData,
      to,
    },
  })
