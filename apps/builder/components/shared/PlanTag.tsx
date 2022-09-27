import { Tag, TagProps } from '@chakra-ui/react'
import { Plan } from 'db'

export const PlanTag = ({ plan, ...props }: { plan?: Plan } & TagProps) => {
  switch (plan) {
    case Plan.LIFETIME: {
      return (
        <Tag colorScheme="purple" data-testid="lifetime-plan-tag" {...props}>
          Lifetime
        </Tag>
      )
    }
    case Plan.PRO: {
      return (
        <Tag colorScheme="blue" data-testid="pro-plan-tag" {...props}>
          Pro
        </Tag>
      )
    }
    case Plan.OFFERED:
    case Plan.STARTER: {
      return (
        <Tag colorScheme="orange" data-testid="starter-plan-tag" {...props}>
          Starter
        </Tag>
      )
    }
    default: {
      return (
        <Tag colorScheme="gray" data-testid="free-plan-tag" {...props}>
          Free
        </Tag>
      )
    }
  }
}
