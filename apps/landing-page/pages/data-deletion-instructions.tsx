import { Stack, Heading } from '@chakra-ui/react'
import { Header } from 'components/common/Header/Header'
import { SocialMetaTags } from 'components/common/SocialMetaTags'
// import { TextLink } from 'components/common/TextLink'

const PrivacyPolicies = () => {
  return (
    <div className="flex flex-col items-center w-full overflow-x-hidden ">
      <SocialMetaTags
        currentUrl={`https://www.flowdacity.com/data-deletion-instructions`}
      />
      <Header />
      <Stack spacing={10} mx="auto" maxW="3xl" my="20">
        <Heading as="h1">Data Deletion Instruction</Heading>

        <p>
          Flowdacity is just a web base application and we do not save your
          personal data in our server. According to Facebook policy, we have to
          provide User Data Deletion Callback URL or Data Deletion Instructions
          URL.
        </p>

        <p>
          If you want to delete your activities for Dug Dug Login App, you can
          remove your information by following these steps:
        </p>

        <ul>
          <li>
            Go to your Facebook Account’s Setting & Privacy. Click “Settings”
          </li>
          <li>
            Look for “Apps and Websites” and you will see all of the apps and
            websites you linked with your Facebook.
          </li>
          <li>Search and Click “Flowdacity” in the search bar.</li>
          <li>Scroll and click “Remove”.</li>
        </ul>

        <p>
          Congratulations, you have successfully removed your app activities. If
          you wish to delete user account data, you have to request us to delete
          your account. Subject to your Flowdacity user account is no longer
          required in the future, please send your request with account
          registered email to admin@flowdacity.com. Your account will be deleted
          and all data will no longer be saved.
        </p>
      </Stack>
    </div>
  )
}

export default PrivacyPolicies
