import { SmtpCredentialsData } from 'models'
import { sendRequest } from 'utils'

export const testSmtpConfig = (smtpData: SmtpCredentialsData, to: string) =>
  sendRequest({
    method: 'POST',
    url: '/api/integrations/email/test-config',
    body: {
      ...smtpData,
      to,
    },
  })
