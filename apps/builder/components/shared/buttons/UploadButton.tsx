import { Button, ButtonProps, Flex, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Table, TableContainer, Tbody, Td, Tfoot, Th, Thead, Tr, chakra } from '@chakra-ui/react'
import { BotSpecificationOption, useWorkspace } from 'contexts/WorkspaceContext'
import React, { ChangeEvent, useEffect, useState } from 'react'
import fileUploader from 'services/octadesk/fileUploader/fileUploader'
import { ErrorMessage, FooterMessage, ModalTitle, MoreDetailsButton } from './UploadButton.style'
import {
  CheckCircleOutlineIcon,
  BlockIcon,
} from 'assets/icons'
type UploadButtonProps = {
  filePath: string
  includeFileName?: boolean
  onFileUploaded: (url: string, type: string, name: string, size: number) => void
} & ButtonProps
export const UploadButton = ({
  filePath,
  includeFileName,
  onFileUploaded,
  ...props
}: UploadButtonProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const { workspace, botSpecificationsChannelsInfo, botChannelsSpecifications } = useWorkspace()
  const [maxFilesize, setMaxFilesize] = useState<number>(30)
  const [supportedExtensions, setSupportedExtensions] = useState<Array<string>>()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const alertFileSizeExtension = {
    "text": `Use arquivos com até ${maxFilesize}MB e extensão ${supportedExtensions}`,
    "and": "e",
    "infoBtn": "Mais detalhes aqui."
  }

  const handleMaxFilesize = (channel: string) => {
    const getAttachmentMaxSize = botSpecificationsChannelsInfo.find(
      item => item.id === 'attachmentMaxSize'
    )

    if (getAttachmentMaxSize && channel) {
      const convertToMb =
        (getAttachmentMaxSize as any)[channel].value /
        1000 /
        1000

      setMaxFilesize(convertToMb)
    }
  }

  const handleSupportedExtensions = (channel: string) => {
    const getSupportedExtensions = botSpecificationsChannelsInfo.find(
      item => item.id === 'supportedExtensions'
    )

    if (getSupportedExtensions && channel) {
      const extensions =
        (getSupportedExtensions as any)[channel]
      if (extensions.length) {
        const andI18n = (alertFileSizeExtension as any)['e']

        const reducedSupportedExtensions = extensions.reduce(
          (previous: string, current: string, index: number, array: any) => {
            if (index === array.length - 1) {
              return `.${previous} ${andI18n} .${current}`
            }

            return `${previous}, .${current}`
          }
        )

        setSupportedExtensions(reducedSupportedExtensions)
      }
    }
  }

  useEffect(() => {
    if (workspace && workspace.channel) {
      handleMaxFilesize(workspace.channel)
      handleSupportedExtensions(workspace.channel)
    }
  }, [workspace])

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);
    const uploader = await fileUploader();
    if (!e.target?.files) return

    const file = e.target.files[0]

    if (file.size > (maxFilesize * 1000 * 1000)) {
      setIsUploading(false)
      setErrorMessage(`Ops! O tamanho máximo permitido é ${maxFilesize}MB`)
      return
    }
    uploader.upload(file).then((resp): any => {
      const url = resp.data.url;
      const convertedToMb = file.size / 1000 / 1000;
      if (url) onFileUploaded(url, file.type, file.name, convertedToMb)
      setIsUploading(false)
    });
  }

  const channelTranslations = {
    "resources": "Recursos",
    "whatsapp": "WhatsApp",
    "WABA": "WhatsApp Oficial",
    "instagram": "Instagram",
    "facebook-messenger": "Messenger",
    "web": "Widget"
  }

  const channelsWidth = (100 - 30) / botChannelsSpecifications.length

  const uniqueBotChannelsSpecifications = [...new Set(botChannelsSpecifications)]

  const headers = [
    {
      text: 'Recursos',
      value: 'resources',
      width: '30%'
    },
    ...uniqueBotChannelsSpecifications.map(channel => ({
      text: (channelTranslations as any)[channel],
      value: channel,
      width: `${channelsWidth}%`
    }))
  ]

  const handleMoreDetailsClick = () => {
    setIsModalOpen(true)
  }

  const handleCloseDetailsModal = () => {
    setIsModalOpen(false)
  }

  const convertToMb = (fileSize: number) => {
    return fileSize / 1000 / 1000
  }

  const renderItem = (item: BotSpecificationOption, channel: string): any => {

    switch (item.id) {
      case 'lineThrough':
        return 'lineThrough'
      case 'supportedExtensions':
        return (item as any)[channel].value?.length ? 'Arquivos *.jpg, *.gif,*.png, *.ico, *.bmp' : 'Áudios, imagens,vídeos e documentos'
      case 'attachmentMaxSize':
        return `Até ${convertToMb((item as any)[channel].value)}mB`
      case 'exclusiveComponents':
        return (item as any)[channel].value?.length ? (item as any)[channel].value.toString().replaceAll(',', ', ') : ''
      default:
        return (item as any)[channel].value ? <CheckCircleOutlineIcon fontSize={24} /> : <BlockIcon fontSize={24} />
    }
  }

  return (
    <>
      <Flex justify="center" direction='column'>
        <chakra.input
          data-testid="file-upload-input"
          type="file"
          id="file-input"
          display="none"
          onChange={handleInputChange}
          accept=".jpg, .jpeg, .png, image/*, audio/*, video/*, .xlsx, .xls, image/*, .doc, .docx, .ppt, .pptx, .txt, .pdf"
        />
        <Button
          as="label"
          size="md"
          htmlFor="file-input"
          cursor="pointer"
          isLoading={isUploading}
          {...props}
        >
          {props.children}
        </Button>
        <ErrorMessage>
          {errorMessage && errorMessage}
        </ErrorMessage>

        <FooterMessage>
          Use arquivos com até {maxFilesize}MB e extensão de áudios, imagens, vídeos e documentos
          <br />
          <MoreDetailsButton onClick={handleMoreDetailsClick}>Mais detalhes aqui.</MoreDetailsButton>
        </FooterMessage>
      </Flex>
      <Modal isOpen={isModalOpen} onClose={handleCloseDetailsModal} isCentered size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader><ModalTitle>Especificações para mensagens em cada canal</ModalTitle></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TableContainer>
              <Table size='sm'>
                <Thead>
                  <Tr>
                    {headers && headers.map((header, idx: number) => <Th key={idx}>{header.text}</Th>)}
                  </Tr>
                </Thead>
                <Tbody>
                  {botSpecificationsChannelsInfo && botSpecificationsChannelsInfo.map(
                    (channel, idx) =>
                      <Tr key={idx}>
                        <Td><Flex dir='row' width={100} style={{ whiteSpace: 'break-spaces' }}>{channel.resources}</Flex></Td>
                        {uniqueBotChannelsSpecifications && uniqueBotChannelsSpecifications.map(uniqueChannel => <Td key={uniqueChannel} style={{ whiteSpace: 'break-spaces' }}>{renderItem(channel, uniqueChannel)}</Td>)}
                        {/* <Td><Flex dir='row' width={100} style={{ whiteSpace: 'break-spaces' }}>{renderItem(channel)}</Flex></Td>
                        <Td><Flex dir='row' width={100} style={{ whiteSpace: 'break-spaces' }}>{channel[`facebook-messenger`].value}</Flex></Td>
                        <Td><Flex dir='row' width={100} style={{ whiteSpace: 'break-spaces' }}>{channel.web.value}</Flex></Td>
                        <Td><Flex dir='row' width={100} style={{ whiteSpace: 'break-spaces' }}>{channel.instagram.value}</Flex></Td>
                        <Td><Flex dir='row' width={100} style={{ whiteSpace: 'break-spaces' }}>{channel.WABA.value}</Flex></Td> */}
                      </Tr>
                  )}
                  {/* <Tr>
                    <Td>feet</Td>
                    <Td>centimetres (cm)</Td>
                    <Td isNumeric>30.48</Td>
                  </Tr>
                  <Tr>
                    <Td>yards</Td>
                    <Td>metres (m)</Td>
                    <Td isNumeric>0.91444</Td>
                  </Tr> */}
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={handleCloseDetailsModal}>
              Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
