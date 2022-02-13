import { Tag } from '@chakra-ui/react'
import { Plan } from 'db'

export const SubscriptionTag = ({ plan }: { plan?: Plan }) => {
  switch (plan) {
    case Plan.FREE: {
      return <Tag>Free plan</Tag>
    }
    case Plan.LIFETIME: {
      return <Tag colorScheme="yellow">Lifetime plan</Tag>
    }
    case Plan.OFFERED: {
      return <Tag>Offered</Tag>
    }
    case Plan.PRO: {
      return <Tag colorScheme="orange">Pro plan</Tag>
    }
    default: {
      return <Tag>Free plan</Tag>
    }
  }
}
