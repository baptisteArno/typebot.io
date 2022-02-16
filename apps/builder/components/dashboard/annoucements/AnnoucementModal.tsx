import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  Stack,
  Link,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const localStorageKey = 'typebot-20-modal'
export const AnnoucementModal = ({ isOpen, onClose }: Props) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(localStorageKey)) setShow(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCloseClick = () => {
    localStorage.setItem(localStorageKey, 'hide')
    setShow(false)
    onClose()
  }

  if (!show) return <></>
  return (
    <Modal isOpen={isOpen} onClose={handleCloseClick} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>What's new in Typebot 2.0?</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Stack} spacing="6" pb="10">
          <Text>Typebo 2.0 has been launched February the 15th 🎉.</Text>
          <iframe
            width="620"
            height="315"
            src="https://www.youtube.com/embed/u8FZHvlYviw"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: '5px' }}
          />
          <Text>
            Most questions are answered in this{' '}
            <Link
              href="https://docs.typebot.io"
              color="blue.500"
              textDecor="underline"
            >
              FAQ
            </Link>
            . If you have other questions, open up the bot on the bottom right
            corner. 😃
          </Text>
          <Text>Baptiste.</Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
