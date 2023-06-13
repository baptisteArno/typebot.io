import { FormLabel, Stack } from '@chakra-ui/react'
import { WhatsAppOptionsListOptions, TextBubbleContent } from 'models'
import React, { useEffect, useState } from 'react'
import { TextBubbleEditor } from 'components/shared/Graph/Nodes/StepNode/TextBubbleEditor'
import OctaButton from 'components/octaComponents/OctaButton/OctaButton'
import { Label } from './WhatsAppOptionsListSettingsBody.style'
import { v4 as uuidv4 } from 'uuid'

type WhatsAppOptionsListSettingsBodyProps = {
  options: WhatsAppOptionsListOptions
  onOptionsChange: (options: WhatsAppOptionsListOptions) => void
}

export const WhatsAppOptionsListSettingsBody = ({
  options,
  onOptionsChange,
}: WhatsAppOptionsListSettingsBodyProps) => {
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
  const [optionsListQty, setOptionsListQty] = useState(0)

  useEffect(() => {
    console.log(options)
  }, [])

  const handleHeaderText = (content: any) => {
    // console.log('content header', content)
    onOptionsChange({
      ...options,
      header: content,
    })
    // console.log('options', options)
  }

  const handleBodyText = (content: any) => {
    // console.log('content body', content)
    onOptionsChange({
      ...options,
      body: content,
    })
    // console.log('options', options)
  }

  const handleFooterText = (content: any) => {
    // console.log('content footer', content)
    onOptionsChange({
      ...options,
      footer: content,
    })
    // console.log('options', options)
  }
  const handleListTitle = (content: any) => {
    // console.log('content list title', content)
    // console.log('options', options)
    onOptionsChange({
      ...options,
      listTitle: content,
    })
    // console.log('options', options)
  }

  // const handleAddOption = () => {
  //   const currentOptions: Array<{
  //     description: string
  //     id: string
  //     label: {
  //       content?: TextBubbleContent
  //     }
  //     selected: boolean
  //     value: {
  //       content?: TextBubbleContent
  //     }
  //   }> = []
  //   currentOptions.push(...listOptions)
  //   currentOptions.push({
  //     description: '',
  //     id: uuidv4(),
  //     label: {
  //       content: undefined,
  //     },
  //     selected: true,
  //     value: {
  //       content: undefined,
  //     },
  //   })
  //   setListOptions(currentOptions)

  //   onOptionsChange({
  //     ...options,
  //     listItems: [...currentOptions],
  //   })
  // }

  // const handleListOption = (content: any, itemId: string) => {
  //   console.log('digitei list option', content)
  //   console.log('itemId', itemId)
  //   console.log('options', options)
  //   const test = options?.listItems?.find((listItem) => listItem.id === itemId)
  //   const arr = ['a', 'b', 'c']

  //   // const index = arr.indexOf('a') // 👉️  0
  //   if (test) {
  //     const currentItemIndex = options?.listItems.indexOf(test)
  //     listOptions.splice(currentItemIndex, 1, {
  //       ...test,
  //       label: content,
  //       value: content,
  //     })
  //   }

  //   console.log('item encontrado', test)
  //   onOptionsChange({
  //     ...options,
  //     listItems: listOptions,
  //   })
  //   console.log('listOptions', listOptions)
  // }

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
