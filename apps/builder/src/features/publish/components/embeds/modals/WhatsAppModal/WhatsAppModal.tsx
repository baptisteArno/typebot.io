import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Heading,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Stack,
  Text,
  OrderedList,
  ListItem,
  HStack,
  useDisclosure,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Flex,
} from '@chakra-ui/react'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { CredentialsDropdown } from '@/features/credentials/components/CredentialsDropdown'
import { ModalProps } from '../../EmbedButton'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { WhatsAppCredentialsModal } from './WhatsAppCredentialsModal'
import { TextLink } from '@/components/TextLink'
import { PublishButton } from '../../../PublishButton'
import { useParentModal } from '@/features/graph/providers/ParentModalProvider'
import { trpc } from '@/lib/trpc'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { isDefined } from '@typebot.io/lib/utils'
import { TableList } from '@/components/TableList'
import { Comparison, LogicalOperator } from '@typebot.io/schemas'
import { DropdownList } from '@/components/DropdownList'
import { WhatsAppComparisonItem } from './WhatsAppComparisonItem'
import { AlertInfo } from '@/components/AlertInfo'

export const WhatsAppModal = ({ isOpen, onClose }: ModalProps): JSX.Element => {
  const { typebot, updateTypebot, isPublished } = useTypebot()
  const { ref } = useParentModal()
  const { workspace } = useWorkspace()
  const {
    isOpen: isCredentialsModalOpen,
    onOpen,
    onClose: onCredentialsModalClose,
  } = useDisclosure()

  const whatsAppSettings = typebot?.settings.whatsApp

  const { data: phoneNumberData } = trpc.whatsApp.getPhoneNumber.useQuery(
    {
      credentialsId: whatsAppSettings?.credentialsId as string,
    },
    {
      enabled: !!whatsAppSettings?.credentialsId,
    }
  )

  const toggleEnableWhatsApp = (isChecked: boolean) => {
    if (!phoneNumberData?.id) return
    updateTypebot({
      updates: { whatsAppPhoneNumberId: isChecked ? phoneNumberData.id : null },
      save: true,
    })
  }

  const updateCredentialsId = (credentialsId: string | undefined) => {
    if (!typebot) return
    updateTypebot({
      updates: {
        settings: {
          ...typebot.settings,
          whatsApp: {
            ...typebot.settings.whatsApp,
            credentialsId,
          },
        },
      },
    })
  }

  const updateStartConditionComparisons = (comparisons: Comparison[]) => {
    if (!typebot) return
    updateTypebot({
      updates: {
        settings: {
          ...typebot.settings,
          whatsApp: {
            ...typebot.settings.whatsApp,
            startCondition: {
              logicalOperator:
                typebot.settings.whatsApp?.startCondition?.logicalOperator ??
                LogicalOperator.AND,
              comparisons,
            },
          },
        },
      },
    })
  }

  const updateStartConditionLogicalOperator = (
    logicalOperator: LogicalOperator
  ) => {
    if (!typebot) return
    updateTypebot({
      updates: {
        settings: {
          ...typebot.settings,
          whatsApp: {
            ...typebot.settings.whatsApp,
            startCondition: {
              comparisons:
                typebot.settings.whatsApp?.startCondition?.comparisons ?? [],
              logicalOperator,
            },
          },
        },
      },
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent ref={ref}>
        <ModalHeader>
          <Heading size="md">WhatsApp</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Stack} spacing="6">
          {!isPublished && phoneNumberData?.id && (
            <AlertInfo>You have modifications that can be published.</AlertInfo>
          )}
          <OrderedList spacing={4} pl="4">
            <ListItem>
              <HStack>
                <Text>Select a phone number:</Text>
                {workspace && (
                  <>
                    <WhatsAppCredentialsModal
                      isOpen={isCredentialsModalOpen}
                      onClose={onCredentialsModalClose}
                      onNewCredentials={updateCredentialsId}
                    />
                    <CredentialsDropdown
                      type="whatsApp"
                      workspaceId={workspace.id}
                      currentCredentialsId={whatsAppSettings?.credentialsId}
                      onCredentialsSelect={updateCredentialsId}
                      onCreateNewClick={onOpen}
                      credentialsName="WA phone number"
                      size="sm"
                    />
                  </>
                )}
              </HStack>
            </ListItem>
            {typebot?.settings.whatsApp?.credentialsId && (
              <>
                <ListItem>
                  <Accordion allowToggle>
                    <AccordionItem>
                      <AccordionButton justifyContent="space-between">
                        Start flow only if
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel as={Stack} spacing="4" pt="4">
                        <TableList<Comparison>
                          initialItems={
                            whatsAppSettings?.startCondition?.comparisons ?? []
                          }
                          onItemsChange={updateStartConditionComparisons}
                          Item={WhatsAppComparisonItem}
                          ComponentBetweenItems={() => (
                            <Flex justify="center">
                              <DropdownList
                                currentItem={
                                  whatsAppSettings?.startCondition
                                    ?.logicalOperator
                                }
                                onItemSelect={
                                  updateStartConditionLogicalOperator
                                }
                                items={Object.values(LogicalOperator)}
                                size="sm"
                              />
                            </Flex>
                          )}
                          addLabel="Add a comparison"
                        />
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </ListItem>

                <ListItem>
                  <HStack>
                    <Text>Publish your bot:</Text>
                    <PublishButton size="sm" isMoreMenuDisabled />
                  </HStack>
                </ListItem>
                <ListItem>
                  <SwitchWithLabel
                    label="Enable WhatsApp integration"
                    initialValue={
                      isDefined(typebot?.whatsAppPhoneNumberId) ? true : false
                    }
                    onCheckChange={toggleEnableWhatsApp}
                    justifyContent="flex-start"
                  />
                </ListItem>
                {phoneNumberData?.id && (
                  <ListItem>
                    <TextLink
                      href={`https://wa.me/${phoneNumberData.name}?text=Start`}
                      isExternal
                    >
                      Try it out
                    </TextLink>
                  </ListItem>
                )}
              </>
            )}
          </OrderedList>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
