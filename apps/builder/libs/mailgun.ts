import Mailgun from 'mailgun.js'
import formData from 'form-data'

export const initMailgun = () => {
  const mailgun = new Mailgun(formData)
  return mailgun.client({
    username: 'api',
    key: '0b024a6aac02d3f52d30999674bcde30-53c13666-e8653f58',
    url: 'https://api.eu.mailgun.net',
  })
}
