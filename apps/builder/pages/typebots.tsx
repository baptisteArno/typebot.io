import React from 'react'
import { Stack, Text, VStack } from '@chakra-ui/layout'
import { DashboardHeader } from 'components/dashboard/DashboardHeader'
import { Seo } from 'components/Seo'
import { FolderContent } from 'components/dashboard/FolderContent'
import { TypebotDndContext } from 'contexts/TypebotDndContext'
import { Spinner } from '@chakra-ui/react'
import { NextPageContext } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

const DashboardPage = () => {
  const isLoading = false

  return (
    <Stack minH="100vh">
      <Seo title="My typebots" />
      <DashboardHeader />
      <TypebotDndContext>
        {isLoading ? (
          <VStack w="full" justifyContent="center" pt="10" spacing={6}>
            <Text>You are being redirected...</Text>
            <Spinner />
          </VStack>
        ) : (
          <FolderContent folder={null} />
        )}
      </TypebotDndContext>
    </Stack>
  )
}

export async function getServerSideProps(context: NextPageContext) {
  const redirectPath = context.query.redirectPath?.toString()

  return redirectPath
    ? {
        redirect: {
          permanent: false,
          destination: redirectPath,
        },
      }
    : {
        props: {
          ...(await serverSideTranslations(context.locale as string, [
            'common',
          ])),
        },
      }
}

export default DashboardPage
