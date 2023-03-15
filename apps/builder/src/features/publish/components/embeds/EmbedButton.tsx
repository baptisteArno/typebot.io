import {
  Button,
  useDisclosure,
  VStack,
  WrapItem,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  WordpressLogo,
  ShopifyLogo,
  WixLogo,
  GtmLogo,
  JavascriptLogo,
  ReactLogo,
  NotionLogo,
  WebflowLogo,
  IframeLogo,
  OtherLogo,
} from './logos'
import React from 'react'
import {
  WordpressModal,
  ShopifyModal,
  WebflowModal,
  GtmModal,
  JavascriptModal,
  ReactModal,
  NotionModal,
  IframeModal,
  WixModal,
} from './modals'
import { OtherModal } from './modals/OtherModal'
import { ScriptModal } from './modals/Script/ScriptModal'
import { CodeIcon } from '@/components/icons'
import { ApiModal } from './modals/ApiModal'
import { ScriptIcon } from '@/features/blocks/logic/script/components/ScriptIcon'

export type ModalProps = {
  publicId: string
  isPublished: boolean
  isOpen: boolean
  onClose: () => void
}

type EmbedButtonProps = Pick<ModalProps, 'publicId' | 'isPublished'> & {
  logo: JSX.Element
  label: string
  Modal: (props: ModalProps) => JSX.Element
}

export const EmbedButton = ({
  logo,
  label,
  Modal,
  ...modalProps
}: EmbedButtonProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <WrapItem
      as={Button}
      alignItems="center"
      variant="outline"
      style={{ width: '225px', height: '270px' }}
      onClick={onOpen}
      whiteSpace={'normal'}
    >
      <VStack>
        {logo}
        <Text>{label}</Text>
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose} {...modalProps} />
    </WrapItem>
  )
}

export const integrationsList = [
  (props: Pick<ModalProps, 'publicId' | 'isPublished'>) => (
    <EmbedButton
      logo={<WordpressLogo height={100} width="70px" />}
      label="Wordpress"
      Modal={WordpressModal}
      {...props}
    />
  ),
  (props: Pick<ModalProps, 'publicId' | 'isPublished'>) => (
    <EmbedButton
      logo={<ShopifyLogo height={100} width="65px" />}
      label="Shopify"
      Modal={ShopifyModal}
      {...props}
    />
  ),
  (props: Pick<ModalProps, 'publicId' | 'isPublished'>) => (
    <EmbedButton
      logo={<WixLogo height={100} width="90px" />}
      label="Wix"
      Modal={WixModal}
      {...props}
    />
  ),
  (props: Pick<ModalProps, 'publicId' | 'isPublished'>) => (
    <EmbedButton
      logo={<GtmLogo height={100} width="70px" />}
      label="Google Tag Manager"
      Modal={GtmModal}
      {...props}
    />
  ),
  (props: Pick<ModalProps, 'publicId' | 'isPublished'>) => (
    <EmbedButton
      logo={<JavascriptLogo height={100} width="70px" />}
      label="HTML & Javascript"
      Modal={JavascriptModal}
      {...props}
    />
  ),
  (props: Pick<ModalProps, 'publicId' | 'isPublished'>) => (
    <EmbedButton
      logo={<ReactLogo height={100} width="70px" />}
      label="React"
      Modal={ReactModal}
      {...props}
    />
  ),
  (props: Pick<ModalProps, 'publicId' | 'isPublished'>) => (
    <EmbedButton
      logo={<CodeIcon height={100} width="60px" />}
      label="API"
      Modal={ApiModal}
      {...props}
    />
  ),
  (props: Pick<ModalProps, 'publicId' | 'isPublished'>) => (
    <EmbedButton
      logo={<NotionLogo height={100} width="60px" />}
      label="Notion"
      Modal={NotionModal}
      {...props}
    />
  ),
  (props: Pick<ModalProps, 'publicId' | 'isPublished'>) => (
    <EmbedButton
      logo={<WebflowLogo height={100} width="70px" />}
      label="Webflow"
      Modal={WebflowModal}
      {...props}
    />
  ),
  (props: Pick<ModalProps, 'publicId' | 'isPublished'>) => (
    <EmbedButton
      logo={
        <ScriptIcon
          height={100}
          width="70px"
          color={useColorModeValue('gray.800', 'gray.300')}
        />
      }
      label="Script"
      Modal={ScriptModal}
      {...props}
    />
  ),
  (props: Pick<ModalProps, 'publicId' | 'isPublished'>) => (
    <EmbedButton
      logo={<IframeLogo height={100} width="70px" />}
      label="Iframe"
      Modal={IframeModal}
      {...props}
    />
  ),
  (props: Pick<ModalProps, 'publicId' | 'isPublished'>) => (
    <EmbedButton
      logo={<OtherLogo height={100} width="70px" />}
      label="Other"
      Modal={OtherModal}
      {...props}
    />
  ),
]
