import { Flex, FormLabel, Spacer, Stack } from '@chakra-ui/react'
import { WhatsAppOptionsListOptions, Variable } from 'models'
import React, { useEffect, useState } from 'react'
import { TextBubbleEditor } from 'components/shared/Graph/Nodes/StepNode/TextBubbleEditor'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { Node } from 'slate'

type WhatsAppOptionsListSettingsBodyProps = {
  options: WhatsAppOptionsListOptions
  onOptionsChange: (options: WhatsAppOptionsListOptions) => void
}

export const WhatsAppOptionsListSettingsBody = ({
  options,
  onOptionsChange,
}: WhatsAppOptionsListSettingsBodyProps) => {
  const [value, setValue] = useState({
    header: '',
    body: '',
    footer: '',
    listTitle: '',
  })
  const MAX_LENGHT_HEADER_AND_FOOTER = 60
  const MAX_LENGHT_BODY = 1024
  const MAX_LENGHT_LIST_TITLE = 20
  const handleVariableChange = (variable: Variable) => {
    onOptionsChange({
      ...options,
      property: {
        domain: variable.domain,
        name: variable.name,
        type: variable.type ? variable.type : 'string',
        token: variable.token,
      },
      variableId: variable.id,
    })
  }

  const handleHeaderText = (content: any) => {
    const updateHeaderText = { header: content.plainText }
    setValue((value) => ({
      ...value,
      ...updateHeaderText,
    }))
    onOptionsChange({
      ...options,
      header: {
        content,
      },
    })
  }

  const handleBodyText = (content: any) => {
    const updateBodyText = { body: content.plainText }
    setValue((value) => ({
      ...value,
      ...updateBodyText,
    }))
    onOptionsChange({
      ...options,
      body: {
        content,
      },
    })
  }

  const handleFooterText = (content: any) => {
    const updateFooterText = { footer: content.plainText }
    setValue((value) => ({
      ...value,
      ...updateFooterText,
    }))
    onOptionsChange({
      ...options,
      footer: {
        content,
      },
    })
  }
  const handleListTitle = (content: any) => {
    const updateListTitleText = { listTitle: content.plainText }
    setValue((value) => ({
      ...value,
      ...updateListTitleText,
    }))
    onOptionsChange({
      ...options,
      listTitle: {
        content,
      },
    })
  }

  return (
    <Stack spacing={4}>
      <Stack>
        <Flex>
          <FormLabel mb="0" htmlFor="button">
            Texto do cabeçalho
          </FormLabel>
          <Spacer />
          <FormLabel mb="0" htmlFor="button">
            {value?.header?.length ?? 0}/{MAX_LENGHT_HEADER_AND_FOOTER}
          </FormLabel>
        </Flex>
        <TextBubbleEditor
          onClose={handleHeaderText}
          initialValue={
            options.header?.content ? options.header.content.richText : []
          }
          onKeyUp={handleHeaderText}
          maxLength={MAX_LENGHT_HEADER_AND_FOOTER}
        />
      </Stack>
      <Stack>
        <Flex>
          <FormLabel mb="0" htmlFor="button">
            Texto do corpo da mensagem
          </FormLabel>
          <Spacer />
          <FormLabel mb="0" htmlFor="button">
            {value?.body?.length ?? 0}/{MAX_LENGHT_BODY}
          </FormLabel>
        </Flex>
        <TextBubbleEditor
          required={{
            errorMsg: 'O campo "Texto do corpo da mensagem" é obrigatório',
          }}
          onClose={handleBodyText}
          initialValue={
            options.body?.content ? options.body.content.richText : []
          }
          onKeyUp={handleBodyText}
          maxLength={MAX_LENGHT_BODY}
        />
      </Stack>
      <Stack>
        <Flex>
          <FormLabel mb="0" htmlFor="button">
            Texto do rodapé
          </FormLabel>
          <Spacer />
          <FormLabel mb="0" htmlFor="button">
            {value?.footer?.length ?? 0}/{MAX_LENGHT_HEADER_AND_FOOTER}
          </FormLabel>
        </Flex>
        <TextBubbleEditor
          onClose={handleFooterText}
          initialValue={
            options.footer?.content ? options.footer.content.richText : []
          }
          onKeyUp={handleFooterText}
          maxLength={MAX_LENGHT_HEADER_AND_FOOTER}
        />
      </Stack>
      <Stack>
        <Flex>
          <FormLabel mb="0" htmlFor="button">
            Título da lista
          </FormLabel>
          <Spacer />
          <FormLabel mb="0" htmlFor="button">
            {value?.listTitle?.length ?? 0}/{MAX_LENGHT_LIST_TITLE}
          </FormLabel>
        </Flex>
        <TextBubbleEditor
          required={{ errorMsg: 'O campo "Título da lista" é obrigatório' }}
          onClose={handleListTitle}
          initialValue={
            options.listTitle?.content
              ? options.listTitle.content?.richText
              : []
          }
          onKeyUp={handleListTitle}
          maxLength={MAX_LENGHT_LIST_TITLE}
        />
      </Stack>
      <Stack>
        <VariableSearchInput
          initialVariableId={options.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
