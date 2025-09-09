import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Flex,
  HStack,
  ListItem,
  OrderedList,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { LogicalOperator } from "@typebot.io/conditions/constants";
import type { Comparison } from "@typebot.io/conditions/schemas";
import { isDefined } from "@typebot.io/lib/utils";
import { defaultSessionExpiryTimeout } from "@typebot.io/settings/constants";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { AlertInfo } from "@/components/AlertInfo";
import { NumberInput } from "@/components/inputs";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { SwitchWithRelatedSettings } from "@/components/SwitchWithRelatedSettings";
import { TableList } from "@/components/TableList";
import { TextLink } from "@/components/TextLink";
import { UnlockPlanAlertInfo } from "@/components/UnlockPlanAlertInfo";
import { PlanTag } from "@/features/billing/components/PlanTag";
import { hasProPerks } from "@/features/billing/helpers/hasProPerks";
import { CredentialsDropdown } from "@/features/credentials/components/CredentialsDropdown";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
import { PublishButton } from "../../../PublishButton";
import type { DialogProps } from "../../DeployButton";
import { WhatsAppComparisonItem } from "./WhatsAppComparisonItem";
import { WhatsAppCredentialsDialog } from "./WhatsAppCredentialsDialog";

export const WhatsAppDeployDialog = ({
  isOpen,
  onClose,
}: DialogProps): JSX.Element => {
  const { typebot, updateTypebot, isPublished } = useTypebot();
  const { workspace } = useWorkspace();
  const {
    isOpen: isCredentialsDialogOpen,
    onOpen,
    onClose: onCredentialsDialogClose,
  } = useDisclosure();

  const whatsAppSettings = typebot?.settings.whatsApp;

  const { data: phoneNumberData } = useQuery(
    trpc.whatsAppInternal.getPhoneNumber.queryOptions(
      {
        credentialsId: typebot?.whatsAppCredentialsId as string,
      },
      {
        enabled: !!typebot?.whatsAppCredentialsId,
      },
    ),
  );

  const toggleEnableWhatsApp = (isChecked: boolean) => {
    if (!phoneNumberData || !typebot) return;
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
    logicalOperator: LogicalOperator | undefined,
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
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog.Popup className="max-w-xl">
        <Dialog.Title>WhatsApp</Dialog.Title>
        <Dialog.CloseButton />
        {!hasProPerks(workspace) && (
          <UnlockPlanAlertInfo excludedPlans={["STARTER"]}>
            Upgrade your workspace to <PlanTag plan="PRO" /> to be able to
            enable WhatsApp integration.
          </UnlockPlanAlertInfo>
        )}
        {!isPublished && phoneNumberData && (
          <AlertInfo>You have modifications that can be published.</AlertInfo>
        )}
        <OrderedList spacing={4} pl="4">
          <ListItem>
            <HStack>
              <Text>Select a phone number:</Text>
              {workspace && (
                <>
                  <WhatsAppCredentialsDialog
                    isOpen={isCredentialsDialogOpen}
                    onClose={onCredentialsDialogClose}
                    onNewCredentials={updateCredentialsId}
                  />
                  <CredentialsDropdown
                    type="whatsApp"
                    scope={{ type: "workspace", workspaceId: workspace.id }}
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
                          defaultValue={whatsAppSettings?.sessionExpiryTimeout}
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
                            whatsAppSettings?.startCondition?.comparisons ?? []
                          }
                          onItemsChange={updateStartConditionComparisons}
                          ComponentBetweenItems={() => (
                            <Flex justify="center">
                              <BasicSelect
                                value={
                                  whatsAppSettings?.startCondition
                                    ?.logicalOperator
                                }
                                onChange={updateStartConditionLogicalOperator}
                                items={Object.values(LogicalOperator)}
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
                  initialValue={typebot?.settings.whatsApp?.isEnabled ?? false}
                  onCheckChange={toggleEnableWhatsApp}
                  justifyContent="flex-start"
                />
              </ListItem>
              <ListItem>
                <HStack>
                  <Text>Publish your bot:</Text>
                  <PublishButton className="size-8" isMoreMenuDisabled />
                </HStack>
              </ListItem>
              {phoneNumberData && (
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
      </Dialog.Popup>
    </Dialog.Root>
  );
};
