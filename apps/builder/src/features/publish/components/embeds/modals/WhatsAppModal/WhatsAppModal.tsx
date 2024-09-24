import { AlertInfo } from "@/components/AlertInfo";
import { DropdownList } from "@/components/DropdownList";
import { SwitchWithRelatedSettings } from "@/components/SwitchWithRelatedSettings";
import { TableList } from "@/components/TableList";
import { TextLink } from "@/components/TextLink";
import { UnlockPlanAlertInfo } from "@/components/UnlockPlanAlertInfo";
import { NumberInput } from "@/components/inputs";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { PlanTag } from "@/features/billing/components/PlanTag";
import { hasProPerks } from "@/features/billing/helpers/hasProPerks";
import { CredentialsDropdown } from "@/features/credentials/components/CredentialsDropdown";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useParentModal } from "@/features/graph/providers/ParentModalProvider";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/trpc";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Flex,
  HStack,
  Heading,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  OrderedList,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { LogicalOperator } from "@typebot.io/conditions/constants";
import type { Comparison } from "@typebot.io/conditions/schemas";
import { isDefined } from "@typebot.io/lib/utils";
import { defaultSessionExpiryTimeout } from "@typebot.io/settings/constants";
import { PublishButton } from "../../../PublishButton";
import type { ModalProps } from "../../EmbedButton";
import { WhatsAppComparisonItem } from "./WhatsAppComparisonItem";
import { WhatsAppCredentialsModal } from "./WhatsAppCredentialsModal";

export const WhatsAppModal = ({ isOpen, onClose }: ModalProps): JSX.Element => {
  const { typebot, updateTypebot, isPublished } = useTypebot();
  const { ref } = useParentModal();
  const { workspace } = useWorkspace();
  const {
    isOpen: isCredentialsModalOpen,
    onOpen,
    onClose: onCredentialsModalClose,
  } = useDisclosure();

  const whatsAppSettings = typebot?.settings.whatsApp;

  const { data: phoneNumberData } =
    trpc.whatsAppInternal.getPhoneNumber.useQuery(
      {
        credentialsId: typebot?.whatsAppCredentialsId as string,
      },
      {
        enabled: !!typebot?.whatsAppCredentialsId,
      },
    );

  const toggleEnableWhatsApp = (isChecked: boolean) => {
    if (!phoneNumberData?.id || !typebot) return;
    updateTypebot({
      updates: {
        settings: {
          ...typebot.settings,
          whatsApp: {
            ...typebot.settings.whatsApp,
            isEnabled: isChecked,
          },
        },
      },
    });
  };

  const updateCredentialsId = (credentialsId: string | undefined) => {
    if (!typebot) return;
    updateTypebot({
      updates: {
        whatsAppCredentialsId: credentialsId,
      },
    });
  };

  const updateStartConditionComparisons = (comparisons: Comparison[]) => {
    if (!typebot) return;
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
    });
  };

  const updateStartConditionLogicalOperator = (
    logicalOperator: LogicalOperator,
  ) => {
    if (!typebot) return;
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
    });
  };

  const updateIsStartConditionEnabled = (isEnabled: boolean) => {
    if (!typebot) return;
    updateTypebot({
      updates: {
        settings: {
          ...typebot.settings,
          whatsApp: {
            ...typebot.settings.whatsApp,
            startCondition: !isEnabled
              ? undefined
              : {
                  comparisons: [],
                  logicalOperator: LogicalOperator.AND,
                },
          },
        },
      },
    });
  };

  const updateSessionExpiryTimeout = (sessionExpiryTimeout?: number) => {
    if (
      !typebot ||
      (sessionExpiryTimeout &&
        (sessionExpiryTimeout <= 0 || sessionExpiryTimeout > 48))
    )
      return;
    updateTypebot({
      updates: {
        settings: {
          ...typebot.settings,
          whatsApp: {
            ...typebot.settings.whatsApp,
            sessionExpiryTimeout,
          },
        },
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent ref={ref}>
        <ModalHeader>
          <Heading size="md">WhatsApp</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Stack} spacing="6">
          {!hasProPerks(workspace) && (
            <UnlockPlanAlertInfo excludedPlans={["STARTER"]}>
              Upgrade your workspace to <PlanTag plan="PRO" /> to be able to
              enable WhatsApp integration.
            </UnlockPlanAlertInfo>
          )}
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
                      currentCredentialsId={
                        typebot?.whatsAppCredentialsId ?? undefined
                      }
                      onCredentialsSelect={updateCredentialsId}
                      onCreateNewClick={onOpen}
                      credentialsName="WA phone number"
                      size="sm"
                    />
                  </>
                )}
              </HStack>
            </ListItem>
            {typebot?.whatsAppCredentialsId && (
              <>
                <ListItem>
                  <Accordion allowToggle>
                    <AccordionItem>
                      <AccordionButton justifyContent="space-between">
                        Configure integration
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel as={Stack} spacing="4" pt="4">
                        <HStack>
                          <NumberInput
                            max={48}
                            min={0}
                            width="100px"
                            label="Session expire timeout:"
                            defaultValue={
                              whatsAppSettings?.sessionExpiryTimeout
                            }
                            placeholder={defaultSessionExpiryTimeout.toString()}
                            moreInfoTooltip="A number between 0 and 48 that represents the time in hours after which the session will expire if the user does not interact with the bot. The conversation restarts if the user sends a message after that expiration time."
                            onValueChange={updateSessionExpiryTimeout}
                            withVariableButton={false}
                            suffix="hours"
                          />
                        </HStack>
                        <SwitchWithRelatedSettings
                          label={"Start bot condition"}
                          initialValue={isDefined(
                            whatsAppSettings?.startCondition,
                          )}
                          onCheckChange={updateIsStartConditionEnabled}
                        >
                          <TableList<Comparison>
                            initialItems={
                              whatsAppSettings?.startCondition?.comparisons ??
                              []
                            }
                            onItemsChange={updateStartConditionComparisons}
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
                          >
                            {(props) => <WhatsAppComparisonItem {...props} />}
                          </TableList>
                        </SwitchWithRelatedSettings>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </ListItem>

                <ListItem>
                  <SwitchWithLabel
                    isDisabled={!hasProPerks(workspace)}
                    label="Enable WhatsApp integration"
                    initialValue={
                      typebot?.settings.whatsApp?.isEnabled ?? false
                    }
                    onCheckChange={toggleEnableWhatsApp}
                    justifyContent="flex-start"
                  />
                </ListItem>
                <ListItem>
                  <HStack>
                    <Text>Publish your bot:</Text>
                    <PublishButton size="sm" isMoreMenuDisabled />
                  </HStack>
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
  );
};
