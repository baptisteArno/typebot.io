import { CodeIcon } from "@/components/icons";
import {
  WhatsAppLogo,
  whatsAppBrandColor,
} from "@/components/logos/WhatsAppLogo";
import { LockTag } from "@/features/billing/components/LockTag";
import { hasProPerks } from "@/features/billing/helpers/hasProPerks";
import { ScriptIcon } from "@/features/blocks/logic/script/components/ScriptIcon";
import { ParentModalProvider } from "@/features/graph/providers/ParentModalProvider";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import {
  Button,
  Text,
  VStack,
  WrapItem,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import type { Plan } from "@typebot.io/prisma/enum";
import React from "react";
import {
  GtmLogo,
  IframeLogo,
  JavascriptLogo,
  NotionLogo,
  ReactLogo,
  ShopifyLogo,
  WebflowLogo,
  WixLogo,
  WordpressLogo,
} from "./logos";
import { FlutterFlowLogo } from "./logos/FlutterFlowLogo";
import { FramerLogo } from "./logos/FramerLogo";
import { NextjsLogo } from "./logos/NextjsLogo";
import {
  GtmModal,
  IframeModal,
  JavascriptModal,
  NotionModal,
  ReactModal,
  ShopifyModal,
  WebflowModal,
  WixModal,
  WordpressModal,
} from "./modals";
import { ApiModal } from "./modals/ApiModal";
import { FlutterFlowModal } from "./modals/FlutterFlowModal";
import { FramerModal } from "./modals/FramerModal";
import { NextjsModal } from "./modals/Nextjs/NextjsModal";
import { ScriptModal } from "./modals/Script/ScriptModal";
import { WhatsAppModal } from "./modals/WhatsAppModal/WhatsAppModal";

export type ModalProps = {
  publicId: string;
  isPublished: boolean;
  isOpen: boolean;
  onClose: () => void;
};

type EmbedButtonProps = Pick<ModalProps, "publicId" | "isPublished"> & {
  logo: JSX.Element;
  label: string;
  lockTagPlan?: Plan;
  modal: (modalProps: { onClose: () => void; isOpen: boolean }) => JSX.Element;
};

export const EmbedButton = ({
  logo,
  label,
  modal,
  lockTagPlan,
  ...modalProps
}: EmbedButtonProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <WrapItem
      as={Button}
      alignItems="center"
      variant="outline"
      style={{ width: "225px", height: "270px" }}
      onClick={onOpen}
      whiteSpace={"normal"}
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
      {modal({ isOpen, onClose, ...modalProps })}
    </WrapItem>
  );
};

export const integrationsList = [
  (props: Pick<ModalProps, "publicId" | "isPublished">) => {
    const { workspace } = useWorkspace();

    return (
      <ParentModalProvider>
        <EmbedButton
          logo={
            <WhatsAppLogo
              height={100}
              width="60px"
              color={whatsAppBrandColor}
            />
          }
          label="WhatsApp"
          lockTagPlan={hasProPerks(workspace) ? undefined : "PRO"}
          modal={({ onClose, isOpen }) => (
            <WhatsAppModal isOpen={isOpen} onClose={onClose} {...props} />
          )}
          {...props}
        />
      </ParentModalProvider>
    );
  },
  (props: Pick<ModalProps, "publicId" | "isPublished">) => (
    <EmbedButton
      logo={<WordpressLogo height={100} width="70px" />}
      label="Wordpress"
      modal={({ onClose, isOpen }) => (
        <WordpressModal isOpen={isOpen} onClose={onClose} {...props} />
      )}
      {...props}
    />
  ),
  (props: Pick<ModalProps, "publicId" | "isPublished">) => (
    <EmbedButton
      logo={<ShopifyLogo height={100} width="65px" />}
      label="Shopify"
      modal={(modalProps) => <ShopifyModal {...modalProps} {...props} />}
      {...props}
    />
  ),
  (props: Pick<ModalProps, "publicId" | "isPublished">) => (
    <EmbedButton
      logo={<WixLogo height={100} width="90px" />}
      label="Wix"
      modal={(modalProps) => <WixModal {...modalProps} {...props} />}
      {...props}
    />
  ),
  (props: Pick<ModalProps, "publicId" | "isPublished">) => (
    <EmbedButton
      logo={<GtmLogo height={100} width="70px" />}
      label="Google Tag Manager"
      modal={(modalProps) => <GtmModal {...modalProps} {...props} />}
      {...props}
    />
  ),
  (props: Pick<ModalProps, "publicId" | "isPublished">) => (
    <EmbedButton
      logo={<JavascriptLogo height={100} width="70px" />}
      label="HTML & Javascript"
      modal={(modalProps) => <JavascriptModal {...modalProps} {...props} />}
      {...props}
    />
  ),
  (props: Pick<ModalProps, "publicId" | "isPublished">) => (
    <EmbedButton
      logo={<ReactLogo height={100} width="70px" />}
      label="React"
      modal={(modalProps) => <ReactModal {...modalProps} {...props} />}
      {...props}
    />
  ),
  (props: Pick<ModalProps, "publicId" | "isPublished">) => (
    <EmbedButton
      logo={<NextjsLogo height={100} width="70px" />}
      label="Nextjs"
      modal={(modalProps) => <NextjsModal {...modalProps} {...props} />}
      {...props}
    />
  ),
  (props: Pick<ModalProps, "publicId" | "isPublished">) => (
    <EmbedButton
      logo={<CodeIcon height={100} width="60px" />}
      label="API"
      modal={(modalProps) => <ApiModal {...modalProps} {...props} />}
      {...props}
    />
  ),
  (props: Pick<ModalProps, "publicId" | "isPublished">) => (
    <EmbedButton
      logo={<NotionLogo height={100} width="60px" />}
      label="Notion"
      modal={(modalProps) => <NotionModal {...modalProps} {...props} />}
      {...props}
    />
  ),
  (props: Pick<ModalProps, "publicId" | "isPublished">) => (
    <EmbedButton
      logo={<WebflowLogo height={100} width="70px" />}
      label="Webflow"
      modal={(modalProps) => <WebflowModal {...modalProps} {...props} />}
      {...props}
    />
  ),
  (props: Pick<ModalProps, "publicId" | "isPublished">) => (
    <EmbedButton
      logo={<FlutterFlowLogo height={100} width="60px" />}
      label="FlutterFlow"
      modal={(modalProps) => <FlutterFlowModal {...modalProps} {...props} />}
      {...props}
    />
  ),
  (props: Pick<ModalProps, "publicId" | "isPublished">) => (
    <EmbedButton
      logo={<FramerLogo height={100} width="60px" />}
      label="Framer"
      modal={(modalProps) => <FramerModal {...modalProps} {...props} />}
      {...props}
    />
  ),
  (props: Pick<ModalProps, "publicId" | "isPublished">) => (
    <EmbedButton
      logo={
        <ScriptIcon
          height={100}
          width="70px"
          color={useColorModeValue("gray.800", "gray.300")}
        />
      }
      label="Script"
      modal={(modalProps) => <ScriptModal {...modalProps} {...props} />}
      {...props}
    />
  ),
  (props: Pick<ModalProps, "publicId" | "isPublished">) => (
    <EmbedButton
      logo={<IframeLogo height={100} width="70px" />}
      label="Iframe"
      modal={(modalProps) => <IframeModal {...modalProps} {...props} />}
      {...props}
    />
  ),
];
