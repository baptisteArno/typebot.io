import { Flex, Stack, Heading, Divider, Button } from '@chakra-ui/react'
import { ChevronLeftIcon } from 'assets/icons'
import { NextChakraLink } from 'components/nextChakra/NextChakraLink'
import React from 'react'
import { PersonalInfoForm } from 'components/account/PersonalInfoForm'
import { BillingSection } from 'components/account/BillingSection'
import { EditorSection } from 'components/account/EditorSection'

export const AccountContent = () => {
  return (
    <Flex h="full" w="full" justifyContent="center" align="flex-start" pb="20">
      <Stack maxW="600px" w="full" pt="4" spacing={10}>
        <Flex>
          <Button
            as={NextChakraLink}
            variant="outline"
            size="sm"
            leftIcon={<ChevronLeftIcon />}
            href="/typebots"
          >
            Back
          </Button>
        </Flex>

        <Heading as="h1" fontSize="3xl">
          Account Settings
        </Heading>
        <Divider />
        <PersonalInfoForm />
        <Divider />
        <BillingSection />
        <Divider />
        <EditorSection />
      </Stack>
    </Flex>
  )
}
