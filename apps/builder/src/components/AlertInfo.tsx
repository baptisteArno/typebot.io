import { AlertProps, Alert, AlertIcon } from '@chakra-ui/react'

export const AlertInfo = (props: AlertProps) => (
  <Alert status="info" bgColor={'blue.50'} rounded="md" {...props}>
    <AlertIcon />
    {props.children}
  </Alert>
)
