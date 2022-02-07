import {
  Button,
  useToast,
  VStack,
  Text,
  IconButton,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react'
import { EyeIcon } from 'assets/icons'
import { TemplateProps } from 'layouts/dashboard/TemplatesContent'
import { Typebot } from 'models'
import React, { useEffect, useState } from 'react'
import { sendRequest } from 'utils'
import { PreviewModal } from './PreviewModal'

type Props = {
  template: TemplateProps
  onClick: (typebot: Typebot) => void
}

export const TemplateButton = ({ template, onClick }: Props) => {
  const [typebot, setTypebot] = useState<Typebot>()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  useEffect(() => {
    fetchTemplate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchTemplate = async () => {
    const { data, error } = await sendRequest(`/templates/${template.fileName}`)
    if (error) return toast({ title: error.name, description: error.message })
    setTypebot(data as Typebot)
  }

  const handleTemplateClick = async () => typebot && onClick(typebot)

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onOpen()
  }

  return (
    <>
      <Button
        as="div"
        style={{ width: '225px', height: '270px' }}
        paddingX={6}
        whiteSpace={'normal'}
        pos="relative"
        cursor="pointer"
        variant="outline"
        colorScheme={'gray'}
        borderWidth={'1px'}
        justifyContent="center"
        onClick={handleTemplateClick}
      >
        <Tooltip label="Preview">
          <IconButton
            icon={<EyeIcon />}
            aria-label="Preview"
            onClick={handlePreviewClick}
            pos="absolute"
            top="20px"
            right="20px"
            variant="outline"
          />
        </Tooltip>

        <VStack spacing="4">
          <Text fontSize={50}>{template.emoji}</Text>
          <Text>{template.name}</Text>
        </VStack>
      </Button>
      {typebot && (
        <PreviewModal
          template={template}
          typebot={typebot}
          isOpen={isOpen}
          onCreateClick={handleTemplateClick}
          onClose={onClose}
        />
      )}
    </>
  )
}
