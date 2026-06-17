import { useQuery } from "@tanstack/react-query";
import { LogicalOperator } from "@typebot.io/conditions/constants";
import type { Comparison } from "@typebot.io/conditions/schemas";
import { isDefined } from "@typebot.io/lib/utils";
import { defaultSessionExpiryTimeout } from "@typebot.io/settings/constants";
import type { WhatsAppWebhookForwardingEventType } from "@typebot.io/settings/schemas";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Alert } from "@typebot.io/ui/components/Alert";
import { Button } from "@typebot.io/ui/components/Button";
import { Checkbox } from "@typebot.io/ui/components/Checkbox";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Select } from "@typebot.io/ui/components/Select";
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
import { orpc } from "@/lib/queryClient";
import { PublishButton } from "../../../PublishButton";
import type { DialogProps } from "../../DeployButton";
import { WhatsAppComparisonItem } from "./WhatsAppComparisonItem";
import { WhatsAppCredentialsDialog } from "./WhatsAppCredentialsDialog";

const webhookForwardingEventTypeItems = [
  { label: "All events", value: "all" },
  { label: "Error statuses", value: "errorStatuses" },
  { label: "Marketing statuses", value: "marketingStatuses" },
] satisfies {
  label: string;
  value: WhatsAppWebhookForwardingEventType;
}[];

const defaultWebhookForwardingEventTypes = [
  "errorStatuses",
  "marketingStatuses",
] satisfies WhatsAppWebhookForwardingEventType[];
const allWebhookForwardingEventTypes = [
  "all",
] satisfies WhatsAppWebhookForwardingEventType[];

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
  const whatsAppCredentialsId = typebot?.whatsAppCredentialsId;

  const { data: phoneNumberData } = useQuery(
    orpc.whatsApp.getPhoneNumber.queryOptions({
      input: {
        credentialsId: whatsAppCredentialsId ?? "",
      },
      enabled: isDefined(whatsAppCredentialsId),
    }),
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
    if (credentialsId) {
      updateTypebot({
        updates: {
          whatsAppCredentialsId: credentialsId,
        },
      });
      return;
    }
    updateTypebot({
      updates: {
        whatsAppCredentialsId: null,
        settings: {
          ...typebot.settings,
          whatsApp: {
            ...typebot.settings.whatsApp,
            isEnabled: false,
          },
        },
      },
      save: true,
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

  const updateIsWebhookForwardingEnabled = (
    isWebhookForwardingEnabled: boolean,
  ) => {
    if (!typebot) return;
    updateTypebot({
      updates: {
        settings: {
          ...typebot.settings,
          whatsApp: {
            ...typebot.settings.whatsApp,
            isWebhookForwardingEnabled,
            webhookForwardingEventTypes: isWebhookForwardingEnabled
              ? (typebot.settings.whatsApp?.webhookForwardingEventTypes ??
                defaultWebhookForwardingEventTypes)
              : undefined,
          },
        },
      },
    });
  };

  const updateWebhookForwardingEventTypes = (
    newWebhookForwardingEventTypes: WhatsAppWebhookForwardingEventType[],
  ) => {
    if (!typebot) return;

    const isAllEventTypesCurrentlySelected =
      typebot.settings.whatsApp?.webhookForwardingEventTypes?.includes("all") ??
      false;
    const webhookForwardingEventTypes = newWebhookForwardingEventTypes.includes(
      "all",
    )
      ? isAllEventTypesCurrentlySelected &&
        newWebhookForwardingEventTypes.length > 1
        ? newWebhookForwardingEventTypes.filter(
            (eventType) => eventType !== "all",
          )
        : allWebhookForwardingEventTypes
      : newWebhookForwardingEventTypes;
    updateTypebot({
      updates: {
        settings: {
          ...typebot.settings,
          whatsApp: {
            ...typebot.settings.whatsApp,
            isWebhookForwardingEnabled: webhookForwardingEventTypes.length > 0,
            webhookForwardingEventTypes:
              webhookForwardingEventTypes.length > 0
                ? webhookForwardingEventTypes
                : undefined,
          },
        },
      },
    });
  };

  const isWebhookForwardingEnabled =
    whatsAppSettings?.isWebhookForwardingEnabled === true;
  const selectedWebhookForwardingEventTypes =
    whatsAppSettings?.webhookForwardingEventTypes ??
    defaultWebhookForwardingEventTypes;
  const selectedWebhookForwardingEventTypesLabel =
    selectedWebhookForwardingEventTypes
      .map(
        (eventType) =>
          webhookForwardingEventTypeItems.find(
            ({ value }) => value === eventType,
          )?.label,
      )
      .filter(isDefined)
      .join(", ");

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
                    currentCredentialsId={whatsAppCredentialsId ?? undefined}
                    onCredentialsSelect={updateCredentialsId}
                    onCreateNewClick={onOpen}
                    credentialsName="WA phone number"
                    size="sm"
                  />
                </>
              )}
            </div>
          </li>
          {whatsAppCredentialsId && phoneNumberData && (
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
                                  className="w-full"
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
                      {whatsAppSettings?.errorAndMarketingStatusWebhookForwardUrl && (
                        <Field.Container>
                          <Field.Root className="flex-row flex-wrap items-center">
                            <Switch
                              checked={isWebhookForwardingEnabled}
                              onCheckedChange={updateIsWebhookForwardingEnabled}
                            />
                            <Field.Label>Forward events</Field.Label>
                            {isWebhookForwardingEnabled && (
                              <Select.Root
                                multiple
                                value={selectedWebhookForwardingEventTypes}
                                items={webhookForwardingEventTypeItems}
                                onValueChange={
                                  updateWebhookForwardingEventTypes
                                }
                              >
                                <Select.Trigger>
                                  <Select.Value>
                                    {selectedWebhookForwardingEventTypesLabel}
                                  </Select.Value>
                                </Select.Trigger>
                                <Select.Content className="min-w-48">
                                  <Select.Group>
                                    {webhookForwardingEventTypeItems.map(
                                      (item) => (
                                        <Select.Item
                                          key={item.value}
                                          className="pr-2 [&>span:first-child]:items-center [&>span:last-child]:hidden"
                                          value={item.value}
                                        >
                                          <Checkbox
                                            checked={selectedWebhookForwardingEventTypes.includes(
                                              item.value,
                                            )}
                                            className="pointer-events-none [&_[data-slot=checkbox-indicator]_*]:!text-gray-1 [&_[data-slot=checkbox-indicator]]:!text-gray-1"
                                            tabIndex={-1}
                                            aria-hidden
                                          />
                                          {item.label}
                                        </Select.Item>
                                      ),
                                    )}
                                  </Select.Group>
                                </Select.Content>
                              </Select.Root>
                            )}
                          </Field.Root>
                        </Field.Container>
                      )}
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
