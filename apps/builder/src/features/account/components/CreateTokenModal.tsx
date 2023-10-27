import { CopyButton } from '@/components/CopyButton'
import { useTranslate } from '@tolgee/react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  Input,
  ModalFooter,
  Button,
  Text,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react'
import React, { FormEvent, useRef, useState } from 'react'
import { createApiTokenQuery } from '../queries/createApiTokenQuery'
import { ApiTokenFromServer } from '../types'

type Props = {
  userId: string
  isOpen: boolean
  onNewToken: (token: ApiTokenFromServer) => void
  onClose: () => void
}

export const CreateTokenModal = ({
  userId,
  isOpen,
  onClose,
  onNewToken,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslate()
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTokenValue, setNewTokenValue] = useState<string>()

  const createToken = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const { data } = await createApiTokenQuery(userId, { name })
    if (data?.apiToken) {
      setNewTokenValue(data.apiToken.token)
      onNewToken(data.apiToken)
    }
    setIsSubmitting(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={inputRef}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {newTokenValue
            ? t('account.apiTokens.createModal.createdHeading')
            : t('account.apiTokens.createModal.createHeading')}
        </ModalHeader>
        <ModalCloseButton />
        {newTokenValue ? (
          <ModalBody as={Stack} spacing="4">
            <Text>
              {t('account.apiTokens.createModal.copyInstruction')}{' '}
              <strong>
                {t('account.apiTokens.createModal.securityWarning')}
              </strong>
            </Text>
            <InputGroup size="md">
              <Input readOnly pr="4.5rem" value={newTokenValue} />
              <InputRightElement width="4.5rem">
                <CopyButton h="1.75rem" size="sm" textToCopy={newTokenValue} />
              </InputRightElement>
            </InputGroup>
          </ModalBody>
        ) : (
          <ModalBody as="form" onSubmit={createToken}>
            <Text mb="4">
              {t('account.apiTokens.createModal.nameInput.label')}
            </Text>
            <Input
              ref={inputRef}
              placeholder={t(
                'account.apiTokens.createModal.nameInput.placeholder'
              )}
              onChange={(e) => setName(e.target.value)}
            />
          </ModalBody>
        )}

        <ModalFooter>
          {newTokenValue ? (
            <Button onClick={onClose} colorScheme="blue">
              {t('account.apiTokens.createModal.doneButton.label')}
            </Button>
          ) : (
            <Button
              colorScheme="blue"
              isDisabled={name.length === 0}
              isLoading={isSubmitting}
              onClick={createToken}
            >
              {t('account.apiTokens.createModal.createButton.label')}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
