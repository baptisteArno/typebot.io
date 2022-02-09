import { Alert, AlertIcon, AlertProps } from '@chakra-ui/react'
import React from 'react'

export const Info = (props: AlertProps) => (
  <Alert status="info" bgColor={'blue.50'} rounded="md" {...props}>
    <AlertIcon />
    {props.children}
  </Alert>
)

export const PublishFirstInfo = (props: AlertProps) => (
  <Info {...props}>You need to publish your typebot first</Info>
)
