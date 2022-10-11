import { AuthSwitcher } from 'components/auth/AuthSwitcher'
// import { SignInForm } from 'components/auth/SignInForm'
import { Heading, VStack } from '@chakra-ui/react'
import React from 'react'
import { Seo } from 'components/Seo'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps, GetStaticPropsContext } from 'next'

import { useTranslation } from 'next-i18next'

// import { OctaBtn } from '@octadesk-tech/web-components'

const SignInPage = () => {
  const { t } = useTranslation('common')
  return (
    <VStack spacing={4} h="100vh" justifyContent="center">
      <Seo title="Sign in" />
      <Heading
        onClick={() => {
          throw new Error('Sentry is working')
        }}
      >
        Sign in
      </Heading>
      <AuthSwitcher type="signin" />
      {/* <SignInForm /> */}
    </VStack>
  )
}

export const getStaticProps: GetStaticProps = async ({
  locale,
}: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale as string, [
      'common'
    ])),
  },
});

export default SignInPage
