import { Tag, TagProps } from '@chakra-ui/react'
import { LockedIcon } from '@/components/icons'
import { Plan } from '@typebot.io/prisma'
import { planColorSchemes } from './PlanTag'

export const LockTag = ({ plan, ...props }: { plan?: Plan } & TagProps) => (
  <Tag
    colorScheme={plan ? planColorSchemes[plan] : 'gray'}
    data-testid={`${plan?.toLowerCase()}-lock-tag`}
    {...props}
  >
    <LockedIcon />
  </Tag>
)
