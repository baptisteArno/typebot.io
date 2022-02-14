import {
  Stack,
  Heading,
  HStack,
  Button,
  Text,
  Input,
  useToast,
} from '@chakra-ui/react'
import { NextChakraLink } from 'components/nextChakra/NextChakraLink'
import { UpgradeButton } from 'components/shared/buttons/UpgradeButton'
import { useUser } from 'contexts/UserContext'
import { Plan } from 'db'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { redeemCoupon } from 'services/coupons'
import { SubscriptionTag } from './SubscriptionTag'

export const BillingSection = () => {
  const { reload } = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { user } = useUser()
  const toast = useToast({
    position: 'top-right',
  })

  const handleCouponCodeRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      coupon: { value: string }
    }
    setIsLoading(true)
    const { data, error } = await redeemCoupon(target.coupon.value)
    if (error) toast({ title: error.name, description: error.message })
    else {
      toast({ description: data?.message })
      setTimeout(reload, 1000)
    }
    setIsLoading(false)
  }

  return (
    <Stack direction="row" spacing="10" justifyContent={'space-between'}>
      <Heading as="h2" fontSize="xl">
        Billing
      </Heading>
      <Stack spacing="6" w="400px">
        <HStack>
          <Text>Your subscription</Text>
          <SubscriptionTag plan={user?.plan} />
        </HStack>
        {user?.stripeId && (
          <Button as={NextChakraLink} href="/api/stripe/customer-portal">
            Manage my subscription
          </Button>
        )}
        {user?.plan === Plan.FREE && <UpgradeButton />}
        {user?.plan === Plan.FREE && (
          <HStack as="form" onSubmit={handleCouponCodeRedeem}>
            <Input name="coupon" placeholder="Coupon code..." />
            <Button type="submit" isLoading={isLoading}>
              Redeem
            </Button>
          </HStack>
        )}
      </Stack>
    </Stack>
  )
}
