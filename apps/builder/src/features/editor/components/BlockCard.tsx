import { LockTag } from "@/features/billing/components/LockTag";
import { isFreePlan } from "@/features/billing/helpers/isFreePlan";
import { ForgedBlockCard } from "@/features/forge/ForgedBlockCard";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { HStack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import { isForgedBlockType } from "@typebot.io/blocks-core/helpers";
import type { BlockV6 } from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { Plan } from "@typebot.io/prisma/enum";
import type React from "react";
import { BlockCardLayout } from "./BlockCardLayout";
import { BlockIcon } from "./BlockIcon";
import { BlockLabel } from "./BlockLabel";

type Props = {
  type: BlockV6["type"];
  tooltip?: string;
  isDisabled?: boolean;
  children: React.ReactNode;
  onMouseDown: (e: React.MouseEvent, type: BlockV6["type"]) => void;
};

export const BlockCard = (
  props: Pick<Props, "type" | "onMouseDown">,
): JSX.Element => {
  const { t } = useTranslate();
  const { workspace } = useWorkspace();

  if (isForgedBlockType(props.type)) {
    return (
      <ForgedBlockCard type={props.type} onMouseDown={props.onMouseDown} />
    );
  }
  switch (props.type) {
    case BubbleBlockType.EMBED:
      return (
        <BlockCardLayout
          {...props}
          tooltip={t("blocks.bubbles.embed.blockCard.tooltip")}
        >
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      );
    case InputBlockType.FILE:
      return (
        <BlockCardLayout
          {...props}
          tooltip={t("blocks.inputs.fileUpload.blockCard.tooltip")}
        >
          <BlockIcon type={props.type} />
          <HStack>
            <BlockLabel type={props.type} />
            {isFreePlan(workspace) && <LockTag plan={Plan.STARTER} />}
          </HStack>
        </BlockCardLayout>
      );
    case LogicBlockType.SCRIPT:
      return (
        <BlockCardLayout
          {...props}
          tooltip={t("editor.blockCard.logicBlock.tooltip.code.label")}
        >
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      );
    case LogicBlockType.TYPEBOT_LINK:
      return (
        <BlockCardLayout
          {...props}
          tooltip={t("editor.blockCard.logicBlock.tooltip.typebotLink.label")}
        >
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      );
    case LogicBlockType.JUMP:
      return (
        <BlockCardLayout
          {...props}
          tooltip={t("editor.blockCard.logicBlock.tooltip.jump.label")}
        >
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      );
    case IntegrationBlockType.GOOGLE_SHEETS:
      return (
        <BlockCardLayout
          {...props}
          tooltip={t("blocks.integrations.googleSheets.blockCard.tooltip")}
        >
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      );
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return (
        <BlockCardLayout
          {...props}
          tooltip={t("blocks.integrations.googleAnalytics.blockCard.tooltip")}
        >
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      );
    default:
      return (
        <BlockCardLayout {...props}>
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      );
  }
};
