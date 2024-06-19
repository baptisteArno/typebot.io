import {
  Button,
  ButtonProps,
  Center,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  chakra,
} from '@chakra-ui/react'
import { BotSpecificationOption, useWorkspace } from 'contexts/WorkspaceContext'
import React, { ChangeEvent, useEffect, useState, useMemo } from 'react'
import fileUploader from 'services/octadesk/fileUploader/fileUploader'
import {
  ChannelSection,
  ErrorMessage,
  FooterMessage,
  ModalTitle,
  MoreDetailsButton,
} from './UploadButton.style'
import { CheckCircleOutlineIcon, BlockIcon } from 'assets/icons'

type UploadButtonProps = {
  filePath: string
  includeFileName?: boolean
  onFileUploaded: (
    url: string,
    type: string,
    name: string,
    size: number
  ) => void
} & ButtonProps
export const UploadButton = ({
  filePath,
  includeFileName,
  onFileUploaded,
  ...props
}: UploadButtonProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const {
    workspace,
    botSpecificationsChannelsInfo,
    botChannelsSpecifications,
  } = useWorkspace()

  const [maxFilesize, setMaxFilesize] = useState<number>(30)
  const [supportedExtensions, setSupportedExtensions] =
    useState<Array<string>>()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const alertFileSizeExtension = {
    text: `Use arquivos com até ${maxFilesize}MB e extensão ${supportedExtensions}`,
    and: 'e',
    infoBtn: 'Mais detalhes aqui.',
  }

  const handleMaxFilesize = (channel: string | undefined) => {
    const getAttachmentMaxSize = botSpecificationsChannelsInfo?.find(
      (item) => item.id === 'attachmentMaxSize'
    ) as any

    if (getAttachmentMaxSize && channel && getAttachmentMaxSize[channel]) {
      const convertToMb =
        (getAttachmentMaxSize as any)[channel].value / 1000 / 1000

      setMaxFilesize(convertToMb)
    }
  }

  const handleSupportedExtensions = (channel: string | undefined) => {
    const getSupportedExtensions = botSpecificationsChannelsInfo?.find(
      (item) => item.id === 'supportedExtensions'
    ) as any

    if (getSupportedExtensions && channel && getSupportedExtensions[channel]) {
      const extensions = getSupportedExtensions[channel]

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
    handleMaxFilesize(workspace?.channel)
    handleSupportedExtensions(workspace?.channel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setIsUploading(false)
    const uploader = await fileUploader()
    if (!e.target?.files) return

    const file = e.target.files[0]

    if (!file) return

    if (file.size > maxFilesize * 1024 * 1024) {
      setErrorMessage(`Ops! O tamanho máximo permitido é ${maxFilesize}MB`)
      return
    }

    setIsUploading(true)
    uploader
      .upload(file)
      .then((resp): any => {
        const url = resp.data.url
        const convertedToMb = file.size / 1000 / 1000
        if (url) onFileUploaded(url, file.type, file.name, convertedToMb)
        setIsUploading(false)
      })
      .catch(() => {
        setIsUploading(false)
      })
  }

  const channelTranslations = {
    resources: 'Recursos',
    whatsapp: 'WhatsApp',
    WABA: 'WhatsApp Oficial',
    instagram: 'Instagram',
    'facebook-messenger': 'Messenger',
    web: 'Widget',
  }

  const channelsWidth = (100 - 30) / botChannelsSpecifications.length

  const uniqueBotChannelsSpecifications = [
    ...new Set(botChannelsSpecifications),
  ]

  const headers = [
    {
      text: '',
      value: '',
      width: '30%',
    },
    ...uniqueBotChannelsSpecifications.map((channel) => ({
      text: (channelTranslations as any)[channel],
      value: channel,
      width: `${channelsWidth}%`,
    })),
  ]

  const textBotChannelsSpecifications = () => {
    const text = ['Negrito', 'Itálico', 'Tachado', 'Sublinhado', 'Emoji']

    const specifications = botSpecificationsChannelsInfo.filter((spec) =>
      text.includes(spec.resources)
    )

    return specifications
  }

  const fileBotChannelsSpecifications = () => {
    const infos = ['supportedExtensions', 'attachmentMaxSize']

    const specifications = botSpecificationsChannelsInfo.filter((spec) =>
      infos.includes(spec.id)
    )

    return specifications
  }

  const specificationsItems = [
    'office-hours',
    'quick-reply:interactive-list',
    'quick-reply:interactive-buttons',
  ]

  const specificationsItemsTranslations = {
    'office-hours': 'Horário de atendimento',
    'quick-reply:interactive-list': 'Pergunta com lista de opções',
    'quick-reply:interactive-buttons': 'Pergunta com botões interativos',
  }
  const listSpecifications = () => {
    return botSpecificationsChannelsInfo.find(
      (elem) => elem.id === 'exclusiveComponents'
    )
  }

  const exclusiveComponentsChannelsSpecifications = () => {
    const result: any = []
    specificationsItems.map((spec) => {
      const list = {
        id: spec,
        resources: (specificationsItemsTranslations as any)[spec],
      }

      uniqueBotChannelsSpecifications.forEach((elem) => {
        const channel: any = (listSpecifications() as any)[elem].value

        ;(list as any)[elem] = (channel && channel.includes(spec)) || false
      })

      result.push(list)
    })

    return result
  }
  const handleMoreDetailsClick = () => {
    exclusiveComponentsChannelsSpecifications()
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
        return <BlockIcon fontSize={24} color="red" />
      case 'supportedExtensions':
        return (item as any)[channel].value?.length
          ? 'Áudios, imagens e vídeos'
          : 'Áudios, imagens, vídeos e documentos'
      case 'attachmentMaxSize':
        if (channel === 'instagram') {
          return 'Imagens até 8mB / outros até 25mB'
        }
        return `Até ${convertToMb((item as any)[channel].value)}mB`
      case 'exclusiveComponents':
        return (item as any)[channel].value?.length
          ? (item as any)[channel].value.toString().replaceAll(',', ', ')
          : ''
      case 'quick-reply:interactive-buttons':
      case 'quick-reply:interactive-list':
      case 'office-hours':
        return (item as any)[channel] ? (
          <CheckCircleOutlineIcon fontSize={24} color="green" />
        ) : (
          <BlockIcon fontSize={24} color="red" />
        )
      default:
        return (item as any)[channel].value ? (
          <CheckCircleOutlineIcon fontSize={24} color="green" />
        ) : (
          <BlockIcon fontSize={24} color="red" />
        )
    }
  }

  const accepedExtensions = useMemo(() => {
    const allExtensions =
      '.jpg, .jpeg, .png, image/*, audio/*, video/*, .xlsx, .xls, image/*, .doc, .docx, .ppt, .pptx, .txt, .pdf'

    const options: { [key: string]: string } = {
      [`instagram`]: '.jpg, .jpeg, .png, image/*, audio/*, video/*',
    }

    if (!workspace?.channel) return allExtensions

    if (workspace?.channel in options) {
      return options[workspace?.channel]
    }
    return allExtensions
  }, [workspace?.channel])

  return (
    <>
      <Flex justify="center" direction="column">
        <chakra.input
          data-testid="file-upload-input"
          type="file"
          id="file-input"
          display="none"
          onChange={handleInputChange}
          accept={accepedExtensions}
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
        <ErrorMessage>{errorMessage && errorMessage}</ErrorMessage>

        <FooterMessage>
          Use arquivos com até {maxFilesize}MB e extensão de áudios, imagens,
          vídeos e documentos
          <br />
          <MoreDetailsButton onClick={handleMoreDetailsClick}>
            Mais detalhes aqui.
          </MoreDetailsButton>
        </FooterMessage>
      </Flex>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseDetailsModal}
        isCentered
        size="full-size"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Especificações para mensagens em cada canal</ModalTitle>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TableContainer>
              <Table size="sm">
                <Thead>
                  <Tr>
                    {headers &&
                      headers.map((header, idx: number) => (
                        <Th key={idx} style={{ textAlign: 'center' }}>
                          {header.text}
                        </Th>
                      ))}
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <ChannelSection>Texto</ChannelSection>
                  </Tr>
                  {textBotChannelsSpecifications() &&
                    textBotChannelsSpecifications().map((channel, idx) => (
                      <Tr key={idx}>
                        <Td
                          style={{
                            whiteSpace: 'break-spaces',
                            textAlign: 'center',
                          }}
                        >
                          <Flex dir="row" width={100}>
                            {channel.resources}
                          </Flex>
                        </Td>
                        {uniqueBotChannelsSpecifications &&
                          uniqueBotChannelsSpecifications.map(
                            (uniqueChannel) => (
                              <Td
                                key={uniqueChannel}
                                style={{
                                  whiteSpace: 'break-spaces',
                                  textAlign: 'center',
                                }}
                              >
                                <Center>
                                  {renderItem(channel, uniqueChannel)}
                                </Center>
                              </Td>
                            )
                          )}
                      </Tr>
                    ))}
                </Tbody>
                <Tbody>
                  <Tr>
                    <ChannelSection>Arquivos e interações</ChannelSection>
                  </Tr>
                  {fileBotChannelsSpecifications() &&
                    fileBotChannelsSpecifications().map((channel, idx) => (
                      <Tr key={idx}>
                        <Td>
                          <Flex dir="row" width={100}>
                            {channel.resources}
                          </Flex>
                        </Td>
                        {uniqueBotChannelsSpecifications &&
                          uniqueBotChannelsSpecifications.map(
                            (uniqueChannel) => (
                              <Td
                                key={uniqueChannel}
                                style={{
                                  whiteSpace: 'break-spaces',
                                  textAlign: 'center',
                                }}
                              >
                                {renderItem(channel, uniqueChannel)}
                              </Td>
                            )
                          )}
                      </Tr>
                    ))}
                </Tbody>
                <Tbody>
                  <Tr>
                    <ChannelSection>
                      Etapas de conversas exclusivas
                    </ChannelSection>
                  </Tr>
                  {exclusiveComponentsChannelsSpecifications() &&
                    exclusiveComponentsChannelsSpecifications().map(
                      (channel: any, idx: number) => (
                        <Tr key={idx}>
                          <Td>
                            <Flex dir="row" width={100}>
                              {channel.resources}
                            </Flex>
                          </Td>
                          {uniqueBotChannelsSpecifications &&
                            uniqueBotChannelsSpecifications.map(
                              (uniqueChannel) => (
                                <Td
                                  key={uniqueChannel}
                                  style={{
                                    whiteSpace: 'break-spaces',
                                    textAlign: 'center',
                                  }}
                                >
                                  <Center>
                                    {renderItem(channel, uniqueChannel)}
                                  </Center>
                                </Td>
                              )
                            )}
                        </Tr>
                      )
                    )}
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleCloseDetailsModal}>
              Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
