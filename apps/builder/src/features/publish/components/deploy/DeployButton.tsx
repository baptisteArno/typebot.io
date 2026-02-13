import { Plan } from "@typebot.io/prisma/enum";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Button } from "@typebot.io/ui/components/Button";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { SourceCodeIcon } from "@typebot.io/ui/icons/SourceCodeIcon";
import { SquareLock01Icon } from "@typebot.io/ui/icons/SquareLock01Icon";
import type { JSX } from "react";
import {
  WhatsAppLogo,
  whatsAppBrandColor,
} from "@/components/logos/WhatsAppLogo";
import { hasProPerks } from "@/features/billing/helpers/hasProPerks";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { ApiDeployDialog } from "./dialogs/ApiDeployDialog";
import { BlinkDeployDialog } from "./dialogs/BlinkDeployDialog";
import { FlutterFlowDeployDialog } from "./dialogs/FlutterFlowDeployDialog";
import { FramerDeployDialog } from "./dialogs/framer/FramerDeployDialog";
import { GtmDeployDialog } from "./dialogs/gtm/GtmDeployDialog";
import { IframeDeployDialog } from "./dialogs/iframe/IframeDeployDialog";
import { JavascriptDeployDialog } from "./dialogs/javascript/JavascriptDeployDialog";
import { NotionDeployDialog } from "./dialogs/NotionDeployDialog";
import { NextjsDeployDialog } from "./dialogs/nextjs/NextjsDeployDialog";
import { ReactDeployDialog } from "./dialogs/react/ReactDeployDialog";
import { ScriptDeployDialog } from "./dialogs/script/ScriptDeployDialog";
import { ShopifyDeployDialog } from "./dialogs/shopify/ShopifyDeployDialog";
import { WebflowDeployDialog } from "./dialogs/webflow/WebflowDeployDialog";
import { WhatsAppDeployDialog } from "./dialogs/whatsApp/WhatsAppDeployDialog";
import { WixDeployDialog } from "./dialogs/wix/WixDeployDialog";
import { WordpressDeployDialog } from "./dialogs/wordpress/WordpressDeployDialog";
import { BlinkLogo } from "./logos/BlinkLogo";
import { FlutterFlowLogo } from "./logos/FlutterFlowLogo";
import { FramerLogo } from "./logos/FramerLogo";
import { GtmLogo } from "./logos/GtmLogo";
import { IframeLogo } from "./logos/IframeLogo";
import { JavascriptLogo } from "./logos/JavascriptLogo";
import { NextjsLogo } from "./logos/NextjsLogo";
import { NotionLogo } from "./logos/NotionLogo";
import { ReactLogo } from "./logos/ReactLogo";
import { ShopifyLogo } from "./logos/ShopifyLogo";
import { WebflowLogo } from "./logos/WebflowLogo";
import { WixLogo } from "./logos/WixLogo";
import { WordpressLogo } from "./logos/WordpressLogo";

export type DialogProps = {
  publicId: string;
  isPublished: boolean;
  isOpen: boolean;
  onClose: () => void;
};

type EmbedButtonProps = Pick<DialogProps, "publicId" | "isPublished"> & {
  logo: JSX.Element;
  label: string;
  lockTagPlan?: Plan;
  dialog: (dialogProps: {
    onClose: () => void;
    isOpen: boolean;
  }) => JSX.Element;
};

export const DeployButton = ({
  logo,
  label,
  dialog,
  lockTagPlan,
  ...dialogProps
}: EmbedButtonProps) => {
  const { isOpen, onOpen, onClose } = useOpenControls();
  return (
    <>
      <Button
        className="h-[270px] text-center whitespace-normal rounded-lg bg-gray-1"
        variant="outline-secondary"
        onClick={onOpen}
        iconStyle="none"
        size="lg"
      >
        <div className="flex flex-col items-center gap-2">
          {logo}
          <p>
            {label}
            {lockTagPlan && (
              <Badge
                colorScheme={lockTagPlan === Plan.PRO ? "purple" : "orange"}
              >
                <SquareLock01Icon />
              </Badge>
            )}
          </p>
        </div>
      </Button>
      {dialog({ isOpen, onClose, ...dialogProps })}
    </>
  );
};

type IntegrationButtonsProps = Pick<DialogProps, "publicId" | "isPublished">;

export const IntegrationButtons = ({
  publicId,
  isPublished,
}: IntegrationButtonsProps) => {
  const { workspace } = useWorkspace();
  return (
    <>
      <DeployButton
        logo={
          <WhatsAppLogo
            className="w-[60px] h-[100px]"
            color={whatsAppBrandColor}
          />
        }
        label="WhatsApp"
        lockTagPlan={hasProPerks(workspace) ? undefined : "PRO"}
        dialog={({ onClose, isOpen }) => (
          <WhatsAppDeployDialog
            isOpen={isOpen}
            onClose={onClose}
            publicId={publicId}
            isPublished={isPublished}
          />
        )}
        publicId={publicId}
        isPublished={isPublished}
      />
      <DeployButton
        logo={<WordpressLogo className="w-[70px] h-[100px]" />}
        label="Wordpress"
        dialog={({ onClose, isOpen }) => (
          <WordpressDeployDialog
            isOpen={isOpen}
            onClose={onClose}
            publicId={publicId}
            isPublished={isPublished}
          />
        )}
        publicId={publicId}
        isPublished={isPublished}
      />
      <DeployButton
        logo={<ShopifyLogo className="w-[65px] h-[100px]" />}
        label="Shopify"
        dialog={(dialogProps) => (
          <ShopifyDeployDialog
            {...dialogProps}
            publicId={publicId}
            isPublished={isPublished}
          />
        )}
        publicId={publicId}
        isPublished={isPublished}
      />
      <DeployButton
        logo={<WixLogo className="w-[90px] h-[100px]" />}
        label="Wix"
        dialog={(dialogProps) => (
          <WixDeployDialog
            {...dialogProps}
            publicId={publicId}
            isPublished={isPublished}
          />
        )}
        publicId={publicId}
        isPublished={isPublished}
      />
      <DeployButton
        logo={<GtmLogo className="w-[70px] h-[100px]" />}
        label="Google Tag Manager"
        dialog={(dialogProps) => (
          <GtmDeployDialog
            {...dialogProps}
            publicId={publicId}
            isPublished={isPublished}
          />
        )}
        publicId={publicId}
        isPublished={isPublished}
      />
      <DeployButton
        logo={<JavascriptLogo className="w-[70px] h-[100px]" />}
        label="HTML & Javascript"
        dialog={(dialogProps) => (
          <JavascriptDeployDialog
            {...dialogProps}
            publicId={publicId}
            isPublished={isPublished}
          />
        )}
        publicId={publicId}
        isPublished={isPublished}
      />
      <DeployButton
        logo={<ReactLogo className="w-[70px] h-[100px]" />}
        label="React"
        dialog={(dialogProps) => (
          <ReactDeployDialog
            {...dialogProps}
            publicId={publicId}
            isPublished={isPublished}
          />
        )}
        publicId={publicId}
        isPublished={isPublished}
      />
      <DeployButton
        logo={<NextjsLogo className="w-[70px] h-[100px]" />}
        label="Nextjs"
        dialog={(dialogProps) => (
          <NextjsDeployDialog
            {...dialogProps}
            publicId={publicId}
            isPublished={isPublished}
          />
        )}
        publicId={publicId}
        isPublished={isPublished}
      />
      <DeployButton
        logo={<SourceCodeIcon className="w-[60px] h-[100px]" />}
        label="API"
        dialog={(dialogProps) => (
          <ApiDeployDialog
            {...dialogProps}
            publicId={publicId}
            isPublished={isPublished}
          />
        )}
        publicId={publicId}
        isPublished={isPublished}
      />
      <DeployButton
        logo={<NotionLogo className="w-[60px] h-[100px]" />}
        label="Notion"
        dialog={(dialogProps) => (
          <NotionDeployDialog
            {...dialogProps}
            publicId={publicId}
            isPublished={isPublished}
          />
        )}
        publicId={publicId}
        isPublished={isPublished}
      />
      <DeployButton
        logo={<WebflowLogo className="w-[70px] h-[100px]" />}
        label="Webflow"
        dialog={(dialogProps) => (
          <WebflowDeployDialog
            {...dialogProps}
            publicId={publicId}
            isPublished={isPublished}
          />
        )}
        publicId={publicId}
        isPublished={isPublished}
      />
      <DeployButton
        logo={<FlutterFlowLogo className="w-[60px] h-[100px]" />}
        label="FlutterFlow"
        dialog={(dialogProps) => (
          <FlutterFlowDeployDialog
            {...dialogProps}
            publicId={publicId}
            isPublished={isPublished}
          />
        )}
        publicId={publicId}
        isPublished={isPublished}
      />
      <DeployButton
        logo={<BlinkLogo className="w-[100px] h-[100px]" />}
        label="Blink"
        dialog={(dialogProps) => (
          <BlinkDeployDialog
            {...dialogProps}
            publicId={publicId}
            isPublished={isPublished}
          />
        )}
        publicId={publicId}
        isPublished={isPublished}
      />
      <DeployButton
        logo={<FramerLogo className="w-[60px] h-[100px]" />}
        label="Framer"
        dialog={(dialogProps) => (
          <FramerDeployDialog
            {...dialogProps}
            publicId={publicId}
            isPublished={isPublished}
          />
        )}
        publicId={publicId}
        isPublished={isPublished}
      />
      <DeployButton
        logo={<SourceCodeIcon className="w-[70px] h-[100px] text-gray-11" />}
        label="Script"
        dialog={(dialogProps) => (
          <ScriptDeployDialog
            {...dialogProps}
            publicId={publicId}
            isPublished={isPublished}
          />
        )}
        publicId={publicId}
        isPublished={isPublished}
      />
      <DeployButton
        logo={<IframeLogo className="w-[70px] h-[100px]" />}
        label="Iframe"
        dialog={(dialogProps) => (
          <IframeDeployDialog
            {...dialogProps}
            publicId={publicId}
            isPublished={isPublished}
          />
        )}
        publicId={publicId}
        isPublished={isPublished}
      />
    </>
  );
};
