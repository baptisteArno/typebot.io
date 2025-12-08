import { useQuery } from "@tanstack/react-query";
import { LogicalOperator } from "@typebot.io/conditions/constants";
import type { Comparison } from "@typebot.io/conditions/schemas";
import { isDefined } from "@typebot.io/lib/utils";
import { defaultSessionExpiryTimeout } from "@typebot.io/settings/constants";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Alert } from "@typebot.io/ui/components/Alert";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { InformationSquareIcon } from "@typebot.io/ui/icons/InformationSquareIcon";
import type { JSX } from "react";
import { BasicNumberInput } from "@/components/inputs/BasicNumberInput";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { TableList } from "@/components/TableList";
import { TextLink } from "@/components/TextLink";
import { ChangePlanDialog } from "@/features/billing/components/ChangePlanDialog";
import { PlanBadge } from "@/features/billing/components/PlanTag";
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
  } = useOpenControls();
  const {
    isOpen: isChangePlanDialogOpen,
    onOpen: onChangePlanDialogOpen,
    onClose: onChangePlanDialogClose,
  } = useOpenControls();

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
          <Alert.Root>
            <InformationSquareIcon />
            <Alert.Description>
              Upgrade your workspace to <PlanBadge plan="PRO" /> to be able to
              enable WhatsApp integration.
            </Alert.Description>
            <Alert.Action>
              <Button variant="secondary" onClick={onChangePlanDialogOpen}>
                Upgrade
              </Button>
              <ChangePlanDialog
                isOpen={isChangePlanDialogOpen}
                onClose={onChangePlanDialogClose}
                excludedPlans={["STARTER"]}
              />
            </Alert.Action>
          </Alert.Root>
        )}
        {!isPublished && phoneNumberData && (
          <Alert.Root>
            <InformationSquareIcon />
            <Alert.Description>
              You have modifications that can be published.
            </Alert.Description>
          </Alert.Root>
        )}
        <ol>
          <li>
            <div className="flex items-center gap-2">
              <p>Select a phone number:</p>
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
            </div>
          </li>
          {typebot?.whatsAppCredentialsId && phoneNumberData && (
            <>
              <li>
                <Accordion.Root>
                  <Accordion.Item>
                    <Accordion.Trigger>Configure integration</Accordion.Trigger>
                    <Accordion.Panel>
                      <Field.Root className="inline-flex flex-row items-center">
                        <Field.Label>
                          Session expire timeout
                          <MoreInfoTooltip>
                            A number between 0 and 48 that represents the time
                            in hours after which the session will expire if the
                            user does not interact with the bot. The
                            conversation restarts if the user sends a message
                            after that expiration time.
                          </MoreInfoTooltip>
                        </Field.Label>
                        <BasicNumberInput
                          max={48}
                          min={0}
                          defaultValue={whatsAppSettings?.sessionExpiryTimeout}
                          placeholder={defaultSessionExpiryTimeout.toString()}
                          onValueChange={updateSessionExpiryTimeout}
                          withVariableButton={false}
                        />
                        hours
                      </Field.Root>
                      <Field.Container>
                        <Field.Root className="flex-row items-center">
                          <Switch
                            checked={isDefined(
                              whatsAppSettings?.startCondition,
                            )}
                            onCheckedChange={updateIsStartConditionEnabled}
                          />
                          <Field.Label>Start bot condition</Field.Label>
                        </Field.Root>
                        {isDefined(whatsAppSettings?.startCondition) && (
                          <TableList<Comparison>
                            initialItems={
                              whatsAppSettings?.startCondition?.comparisons ??
                              []
                            }
                            onItemsChange={updateStartConditionComparisons}
                            ComponentBetweenItems={() => (
                              <div className="flex justify-center">
                                <BasicSelect
                                  value={
                                    whatsAppSettings?.startCondition
                                      ?.logicalOperator
                                  }
                                  onChange={updateStartConditionLogicalOperator}
                                  items={Object.values(LogicalOperator)}
                                />
                              </div>
                            )}
                            addLabel="Add a comparison"
                          >
                            {(props) => <WhatsAppComparisonItem {...props} />}
                          </TableList>
                        )}
                      </Field.Container>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion.Root>
              </li>

              <li>
                <Field.Root className="flex-row items-center">
                  <Switch
                    checked={typebot?.settings.whatsApp?.isEnabled ?? false}
                    disabled={!hasProPerks(workspace)}
                    onCheckedChange={toggleEnableWhatsApp}
                  />
                  <Field.Label>Enable WhatsApp integration</Field.Label>
                </Field.Root>
              </li>
              <li>
                <div className="flex items-center gap-2">
                  <p>Publish your bot:</p>
                  <PublishButton size="sm" isMoreMenuDisabled />
                </div>
              </li>
              {phoneNumberData && (
                <li>
                  <TextLink
                    href={`https://wa.me/${phoneNumberData.name}?text=Start`}
                    isExternal
                  >
                    Try it out
                  </TextLink>
                </li>
              )}
            </>
          )}
        </ol>
      </Dialog.Popup>
    </Dialog.Root>
  );
};
