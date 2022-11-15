import { CloseButton, Flex, HStack, StackProps } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'

type VerifyEmailBannerProps = { id: string } & StackProps

export const Banner = ({ id, ...props }: VerifyEmailBannerProps) => {
  const [show, setShow] = useState(false)
  const localStorageKey = `banner-${id}`

  useEffect(() => {
    if (!localStorage.getItem(localStorageKey)) setShow(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCloseClick = () => {
    localStorage.setItem(localStorageKey, 'hide')
    setShow(false)
  }

  if (!show) return <></>
  return (
    <HStack
      h="50px"
      bgColor="blue.400"
      color="white"
      justifyContent="center"
      align="center"
      w="full"
      {...props}
    >
      <Flex maxW="1000px" justifyContent="space-between" w="full">
        <HStack>{props.children}</HStack>
        <CloseButton rounded="full" onClick={handleCloseClick} />
      </Flex>
    </HStack>
  )
}
