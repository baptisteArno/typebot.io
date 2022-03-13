import React, { useEffect, useState } from 'react'
import { Link, Stack, Text, VStack } from '@chakra-ui/layout'
import { DashboardHeader } from 'components/dashboard/DashboardHeader'
import { Seo } from 'components/Seo'
import { FolderContent } from 'components/dashboard/FolderContent'
import { TypebotDndContext } from 'contexts/TypebotDndContext'
import { useRouter } from 'next/router'
import { redeemCoupon } from 'services/coupons'
import { Spinner, useToast } from '@chakra-ui/react'
import { pay } from 'services/stripe'
import { useUser } from 'contexts/UserContext'
import { Banner } from 'components/dashboard/annoucements/AnnoucementBanner'
import { NextPageContext } from 'next/types'

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const { query, isReady } = useRouter()
  const { user } = useUser()
  const toast = useToast({
    position: 'top-right',
    status: 'success',
  })

  useEffect(() => {
    const subscribe = query.subscribe?.toString()
    if (subscribe && user && user.plan === 'FREE') {
      setIsLoading(true)
      pay(
        user,
        navigator.languages.find((l) => l.includes('fr')) ? 'eur' : 'usd'
      )
    }
  }, [query.subscribe, user])

  useEffect(() => {
    if (!isReady) return
    const couponCode = query.coupon?.toString()
    const stripeStatus = query.stripe?.toString()

    if (document.location.hostname.includes('app.typebot.io'))
      setShowBanner(true)

    if (stripeStatus === 'success')
      toast({
        title: 'Typebot Pro',
        description: "You've successfully subscribed 🎉",
      })
    if (couponCode) {
      setIsLoading(true)
      redeemCoupon(couponCode).then(() => {
        location.href = '/typebots'
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady])

  return (
    <Stack minH="100vh">
      {showBanner && (
        <Banner id={'v1-navigation'}>
          <Text>
            You are on Typebot 2.0. To access the old version, navigate to
          </Text>
          <Link href="https://old.typebot.io" isExternal textDecor="underline">
            https://old.typebot.io
          </Link>
        </Banner>
      )}
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
    : { props: {} }
}

export default DashboardPage
