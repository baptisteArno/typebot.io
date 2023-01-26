import { featherIconsBaseProps } from '@/components/icons'
import { Icon, IconProps, useColorModeValue } from '@chakra-ui/react'

export const WaitIcon = (props: IconProps) => (
  <Icon
    viewBox="0 0 24 24"
    color={useColorModeValue('purple.500', 'purple.300')}
    {...featherIconsBaseProps}
    {...props}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </Icon>
)
