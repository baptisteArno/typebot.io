import { FormLabel, Stack } from '@chakra-ui/react'
import { WhatsAppOptionsListOptions, TextBubbleContent } from 'models'
import React, { useEffect, useState } from 'react'
import { TextBubbleEditor } from 'components/shared/Graph/Nodes/StepNode/TextBubbleEditor'

type WhatsAppOptionsListSettingsBodyProps = {
  options: WhatsAppOptionsListOptions
  onOptionsChange: (options: WhatsAppOptionsListOptions) => void
}

export const WhatsAppOptionsListSettingsBody = ({
  options,
  onOptionsChange,
}: WhatsAppOptionsListSettingsBodyProps) => {
  useEffect(() => {
    console.log(options)
  })
  
  const [listOptions, setListOptions] = useState<
    Array<{
      description: string
      id: string
      label: {
        content?: TextBubbleContent
      }
      selected: boolean
      value: {
        content?: TextBubbleContent
      }
    }>
  >([])

  const handleHeaderText = (content: any) => {
    onOptionsChange({
      ...options,
      header: content,
    })
  }

  const handleBodyText = (content: any) => {
    onOptionsChange({
      ...options,
      body: content,
    })
  }

  const handleFooterText = (content: any) => {
    onOptionsChange({
      ...options,
      footer: content,
    })
  }
  const handleListTitle = (content: any) => {
    onOptionsChange({
      ...options,
      listTitle: content,
    })
  }

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="button">
          Texto do cabeçalho
        </FormLabel>

        <TextBubbleEditor
          increment={1}
          onClose={handleHeaderText}
          initialValue={
            options.header?.content ? options.header.content.richText : []
          }
          onKeyUp={handleHeaderText}
        />
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="button">
          Texto do corpo da mensagem
        </FormLabel>

        <TextBubbleEditor
          increment={1}
          onClose={handleBodyText}
          initialValue={
            options.body?.content ? options.body.content.richText : []
          }
          onKeyUp={handleBodyText}
        />
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="button">
          Texto do rodapé
        </FormLabel>

        <TextBubbleEditor
          increment={1}
          onClose={handleFooterText}
          initialValue={
            options.footer?.content ? options.footer.content.richText : []
          }
          onKeyUp={handleFooterText}
        />
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="button">
          Título da lista
        </FormLabel>

        <TextBubbleEditor
          increment={1}
          onClose={handleListTitle}
          initialValue={
            options.list?.actionLabel.content
              ? options.list.actionLabel.content?.richText
              : []
          }
          onKeyUp={handleListTitle}
        />
      </Stack>
      {/* <Label>Opções com resposta</Label>
      {listOptions?.length &&
        listOptions.map((listOption, idx) => {
          return (
            <Stack key={idx}>
              <FormLabel mb="0" htmlFor="button">
                Opção {idx + 1}
              </FormLabel>

              <TextBubbleEditor
                increment={1}
                onClose={(content) => handleListOption(content, listOption.id)}
                initialValue={
                  listOption?.value.content
                    ? listOption.value.content?.richText
                    : []
                }
                onKeyUp={(content) => handleListOption(content, listOption.id)}
              />
            </Stack>
          )
        })}
      <Stack align="center">
        <OctaButton onClick={handleAddOption}>Adicionar opção</OctaButton>
      </Stack> */}
    </Stack>
  )
}
