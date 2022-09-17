import { Tag } from '@chakra-ui/react'
import { Plan } from 'db'

export const PlanTag = ({ plan }: { plan?: Plan }) => {
  switch (plan) {
    case Plan.LIFETIME:
    case Plan.PRO: {
      return (
        <Tag colorScheme="blue" data-testid="plan-tag">
          Pro
        </Tag>
      )
    }
    case Plan.OFFERED:
    case Plan.STARTER: {
      return (
        <Tag colorScheme="orange" data-testid="plan-tag">
          Starter
        </Tag>
      )
    }
    default: {
      return (
        <Tag colorScheme="gray" data-testid="plan-tag">
          Free
        </Tag>
      )
    }
  }
}
