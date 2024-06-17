import { Icon, IconProps } from '@chakra-ui/icon'
import { featherIconsBaseProps } from './HamburgerIcon'

export const EmailIcon = (props: IconProps) => (
  <Icon
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentcolor"
    {...featherIconsBaseProps}
    {...props}
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </Icon>
)
