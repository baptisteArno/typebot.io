import {
  WhatsAppLogo,
  whatsAppBrandColor,
} from '@/components/logos/WhatsAppLogo'
import { IconProps } from '@chakra-ui/react'
import React from 'react'

export const TriggerWhatsappFlowIcon = (props: IconProps) => (
  <WhatsAppLogo color={whatsAppBrandColor} {...props} />
)
