import { Stack } from '@chakra-ui/react'
import { AccountHeader } from 'components/account/AccountHeader'
import { Seo } from 'components/Seo'
import { UserContext } from 'contexts/UserContext'
import { AccountContent } from 'layouts/account/AccountContent'

const AccountSubscriptionPage = () => {
  return (
    <UserContext>
      <Seo title="My account" />{' '}
      <Stack>
        <AccountHeader />
        <AccountContent />
      </Stack>
    </UserContext>
  )
}
export default AccountSubscriptionPage
