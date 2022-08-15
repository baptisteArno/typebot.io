import { AuthSwitcher } from 'components/auth/AuthSwitcher'
// import { SignInForm } from 'components/auth/SignInForm'
import { Heading, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React from 'react'
import { Seo } from 'components/Seo'

const RegisterPage = () => {
  const { query } = useRouter()

  return (
    <VStack spacing={4} h="100vh" justifyContent="center">
      <Seo title="Register" />
      <Heading>Create an account</Heading>
      <AuthSwitcher type="register" />
      {/* <SignInForm defaultEmail={query.g?.toString()} /> */}
    </VStack>
  )
}

export default RegisterPage
