import { CodeIcon } from "@/components/icons";
import {
  WhatsAppLogo,
  whatsAppBrandColor,
} from "@/components/logos/WhatsAppLogo";
import { LockTag } from "@/features/billing/components/LockTag";
import { hasProPerks } from "@/features/billing/helpers/hasProPerks";
import { ScriptIcon } from "@/features/blocks/logic/script/components/ScriptIcon";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { Text, VStack, useDisclosure } from "@chakra-ui/react";
import type { Plan } from "@typebot.io/prisma/enum";
import { Button } from "@typebot.io/ui/components/Button";
import React from "react";
import { ApiDeployDialog } from "./dialogs/ApiDeployDialog";
import { BlinkDeployDialog } from "./dialogs/BlinkDeployDialog";
import { FlutterFlowDeployDialog } from "./dialogs/FlutterFlowDeployDialog";
import { NotionDeployDialog } from "./dialogs/NotionDeployDialog";
import { FramerDeployDialog } from "./dialogs/framer/FramerDeployDialog";
import { GtmDeployDialog } from "./dialogs/gtm/GtmDeployDialog";
import { IframeDeployDialog } from "./dialogs/iframe/IframeDeployDialog";
import { JavascriptDeployDialog } from "./dialogs/javascript/JavascriptDeployDialog";
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button
        className="w-[225px] h-[270px] text-center whitespace-normal rounded-lg bg-gray-1"
        variant="outline-secondary"
        onClick={onOpen}
        iconStyle="none"
        size="lg"
      >
        <VStack>
          {logo}
          <Text>
            {label}
            {lockTagPlan && (
              <>
                {" "}
                <LockTag plan={lockTagPlan} />
              </>
            )}
          </Text>
        </VStack>
      </Button>
      {dialog({ isOpen, onClose, ...dialogProps })}
    </>
  );
};

export const integrationsList = [
  (props: Pick<DialogProps, "publicId" | "isPublished">) => {
    const { workspace } = useWorkspace();

    return (
      <DeployButton
        logo={
          <WhatsAppLogo height={100} width="60px" color={whatsAppBrandColor} />
        }
        label="WhatsApp"
        lockTagPlan={hasProPerks(workspace) ? undefined : "PRO"}
        dialog={({ onClose, isOpen }) => (
          <WhatsAppDeployDialog isOpen={isOpen} onClose={onClose} {...props} />
        )}
        {...props}
      />
    );
  },
  (props: Pick<DialogProps, "publicId" | "isPublished">) => (
    <DeployButton
      logo={<WordpressLogo height={100} width="70px" />}
      label="Wordpress"
      dialog={({ onClose, isOpen }) => (
        <WordpressDeployDialog isOpen={isOpen} onClose={onClose} {...props} />
      )}
      {...props}
    />
  ),
  (props: Pick<DialogProps, "publicId" | "isPublished">) => (
    <DeployButton
      logo={<ShopifyLogo height={100} width="65px" />}
      label="Shopify"
      dialog={(dialogProps) => (
        <ShopifyDeployDialog {...dialogProps} {...props} />
      )}
      {...props}
    />
  ),
  (props: Pick<DialogProps, "publicId" | "isPublished">) => (
    <DeployButton
      logo={<WixLogo height={100} width="90px" />}
      label="Wix"
      dialog={(dialogProps) => <WixDeployDialog {...dialogProps} {...props} />}
      {...props}
    />
  ),
  (props: Pick<DialogProps, "publicId" | "isPublished">) => (
    <DeployButton
      logo={<GtmLogo height={100} width="70px" />}
      label="Google Tag Manager"
      dialog={(dialogProps) => <GtmDeployDialog {...dialogProps} {...props} />}
      {...props}
    />
  ),
  (props: Pick<DialogProps, "publicId" | "isPublished">) => (
    <DeployButton
      logo={<JavascriptLogo height={100} width="70px" />}
      label="HTML & Javascript"
      dialog={(dialogProps) => (
        <JavascriptDeployDialog {...dialogProps} {...props} />
      )}
      {...props}
    />
  ),
  (props: Pick<DialogProps, "publicId" | "isPublished">) => (
    <DeployButton
      logo={<ReactLogo height={100} width="70px" />}
      label="React"
      dialog={(dialogProps) => (
        <ReactDeployDialog {...dialogProps} {...props} />
      )}
      {...props}
    />
  ),
  (props: Pick<DialogProps, "publicId" | "isPublished">) => (
    <DeployButton
      logo={<NextjsLogo height={100} width="70px" />}
      label="Nextjs"
      dialog={(dialogProps) => (
        <NextjsDeployDialog {...dialogProps} {...props} />
      )}
      {...props}
    />
  ),
  (props: Pick<DialogProps, "publicId" | "isPublished">) => (
    <DeployButton
      logo={<CodeIcon height={100} width="60px" />}
      label="API"
      dialog={(dialogProps) => <ApiDeployDialog {...dialogProps} {...props} />}
      {...props}
    />
  ),
  (props: Pick<DialogProps, "publicId" | "isPublished">) => (
    <DeployButton
      logo={<NotionLogo height={100} width="60px" />}
      label="Notion"
      dialog={(dialogProps) => (
        <NotionDeployDialog {...dialogProps} {...props} />
      )}
      {...props}
    />
  ),
  (props: Pick<DialogProps, "publicId" | "isPublished">) => (
    <DeployButton
      logo={<WebflowLogo height={100} width="70px" />}
      label="Webflow"
      dialog={(dialogProps) => (
        <WebflowDeployDialog {...dialogProps} {...props} />
      )}
      {...props}
    />
  ),
  (props: Pick<DialogProps, "publicId" | "isPublished">) => (
    <DeployButton
      logo={<FlutterFlowLogo height={100} width="60px" />}
      label="FlutterFlow"
      dialog={(dialogProps) => (
        <FlutterFlowDeployDialog {...dialogProps} {...props} />
      )}
      {...props}
    />
  ),
  (props: Pick<DialogProps, "publicId" | "isPublished">) => (
    <DeployButton
      logo={<BlinkLogo height={100} width="100px" />}
      label="Blink"
      dialog={(dialogProps) => (
        <BlinkDeployDialog {...dialogProps} {...props} />
      )}
      {...props}
    />
  ),
  (props: Pick<DialogProps, "publicId" | "isPublished">) => (
    <DeployButton
      logo={<FramerLogo height={100} width="60px" />}
      label="Framer"
      dialog={(dialogProps) => (
        <FramerDeployDialog {...dialogProps} {...props} />
      )}
      {...props}
    />
  ),
  (props: Pick<DialogProps, "publicId" | "isPublished">) => (
    <DeployButton
      logo={<ScriptIcon className="w-[70px] h-[100px] text-gray-11" />}
      label="Script"
      dialog={(dialogProps) => (
        <ScriptDeployDialog {...dialogProps} {...props} />
      )}
      {...props}
    />
  ),
  (props: Pick<DialogProps, "publicId" | "isPublished">) => (
    <DeployButton
      logo={<IframeLogo height={100} width="70px" />}
      label="Iframe"
      dialog={(dialogProps) => (
        <IframeDeployDialog {...dialogProps} {...props} />
      )}
      {...props}
    />
  ),
];
