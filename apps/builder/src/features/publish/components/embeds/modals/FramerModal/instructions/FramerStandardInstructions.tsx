import { OrderedList, ListItem, Code, Stack, Text } from '@chakra-ui/react'
import { JavascriptStandardSnippet } from '../../Javascript/JavascriptStandardSnippet'

export const FramerStandardInstructions = () => (
  <OrderedList spacing={4} pl={5}>
    <ListItem>
      Pressione <Code>A</Code> para abrir o painel{' '}
      <Code>Adicionar Elementos</Code>
    </ListItem>
    <ListItem>
      <Stack spacing={4}>
        <Text>
          Adicione um elemento <Code>Embed</Code> da sessão de{' '}
          <Code>componentes</Code> e cole este código:{' '}
        </Text>
        <JavascriptStandardSnippet />
      </Stack>
    </ListItem>
  </OrderedList>
)
