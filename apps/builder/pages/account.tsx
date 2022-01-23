import { Stack } from '@chakra-ui/react'
import { AccountHeader } from 'components/account/AccountHeader'
import { Seo } from 'components/Seo'
import { AccountContent } from 'layouts/account/AccountContent'

const AccountSubscriptionPage = () => (
  <Stack>
    <Seo title="My account" />
    <AccountHeader />
    <AccountContent />
  </Stack>
)
export default AccountSubscriptionPage
