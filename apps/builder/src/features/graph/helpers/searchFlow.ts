import type { BlockV6, GroupV6 } from '@typebot.io/schemas'

export type SearchResult = {
  groupId: string
  groupTitle: string
  blockId: string
  blockType: string
  blockIndex: number
  groupIndex: number
  matchText: string
  matchContext: string
  coordinates: { x: number; y: number }
}

type RichTextNode = {
  text?: string
  children?: RichTextNode[]
  type?: string
  url?: string
}

/**
 * Extrai texto de nós richText recursivamente
 */
const extractTextFromRichText = (nodes: RichTextNode[] | undefined): string => {
  if (!nodes || !Array.isArray(nodes)) return ''

  return nodes
    .map((node) => {
      if (node.text) return node.text
      if (node.children) return extractTextFromRichText(node.children)
      if (node.url) return node.url
      return ''
    })
    .join(' ')
    .trim()
}

/**
 * Extrai todo o texto pesquisável de um bloco
 */
export const extractTextFromBlock = (block: BlockV6): string[] => {
  const texts: string[] = []

  // Tipo do bloco
  texts.push(block.type)

  // Conteúdo do bloco (text bubbles, etc)
  if ('content' in block && block.content) {
    const content = block.content as Record<string, unknown>

    // richText para text bubbles
    if ('richText' in content && Array.isArray(content.richText)) {
      const richTextContent = extractTextFromRichText(
        content.richText as RichTextNode[]
      )
      if (richTextContent) texts.push(richTextContent)
    }

    // plainText para notes
    if ('plainText' in content && typeof content.plainText === 'string') {
      texts.push(content.plainText)
    }

    // URL para images, videos, audio
    if ('url' in content && typeof content.url === 'string') {
      texts.push(content.url)
    }
  }

  // Opções do bloco
  if ('options' in block && block.options) {
    const options = block.options as Record<string, unknown>

    // Labels (botões, placeholders)
    if ('labels' in options && typeof options.labels === 'object') {
      const labels = options.labels as Record<string, unknown>
      Object.values(labels).forEach((label) => {
        if (typeof label === 'string') texts.push(label)
      })
    }

    // buttonLabel
    if ('buttonLabel' in options && typeof options.buttonLabel === 'string') {
      texts.push(options.buttonLabel)
    }

    // expressionToEvaluate (set variable)
    if (
      'expressionToEvaluate' in options &&
      typeof options.expressionToEvaluate === 'string'
    ) {
      texts.push(options.expressionToEvaluate)
    }

    // URL (redirect, webhook)
    if ('url' in options && typeof options.url === 'string') {
      texts.push(options.url)
    }

    // content para notes
    if ('content' in options && typeof options.content === 'object') {
      const noteContent = options.content as Record<string, unknown>
      if (
        'plainText' in noteContent &&
        typeof noteContent.plainText === 'string'
      ) {
        texts.push(noteContent.plainText)
      }
    }
  }

  // Items (choice buttons, conditions)
  if ('items' in block && Array.isArray(block.items)) {
    block.items.forEach((item) => {
      if ('content' in item && typeof item.content === 'string') {
        texts.push(item.content)
      }
    })
  }

  return texts.filter((text) => text.length > 0)
}

/**
 * Busca em todos os grupos/blocos e retorna os resultados
 */
export const searchFlow = (
  groups: GroupV6[],
  query: string,
  maxResults = 100
): SearchResult[] => {
  if (!query || query.trim().length === 0) return []

  const normalizedQuery = query.toLowerCase().trim()
  const results: SearchResult[] = []

  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    const group = groups[groupIndex]

    // Busca no título do grupo
    if (group.title.toLowerCase().includes(normalizedQuery)) {
      results.push({
        groupId: group.id,
        groupTitle: group.title,
        blockId: group.blocks[0]?.id ?? group.id,
        blockType: 'group',
        blockIndex: 0,
        groupIndex,
        matchText: group.title,
        matchContext: `Grupo: ${group.title}`,
        coordinates: group.graphCoordinates,
      })

      if (results.length >= maxResults) return results
    }

    // Busca nos blocos do grupo
    for (let blockIndex = 0; blockIndex < group.blocks.length; blockIndex++) {
      const block = group.blocks[blockIndex]
      const blockTexts = extractTextFromBlock(block)

      for (const text of blockTexts) {
        if (text.toLowerCase().includes(normalizedQuery)) {
          // Criar contexto com trecho do texto encontrado
          const lowerText = text.toLowerCase()
          const matchStart = lowerText.indexOf(normalizedQuery)
          const contextStart = Math.max(0, matchStart - 20)
          const contextEnd = Math.min(
            text.length,
            matchStart + query.length + 20
          )
          let context = text.slice(contextStart, contextEnd)

          if (contextStart > 0) context = '...' + context
          if (contextEnd < text.length) context = context + '...'

          results.push({
            groupId: group.id,
            groupTitle: group.title,
            blockId: block.id,
            blockType: block.type,
            blockIndex,
            groupIndex,
            matchText: text,
            matchContext: context,
            coordinates: group.graphCoordinates,
          })

          if (results.length >= maxResults) return results

          // Só adiciona um resultado por bloco
          break
        }
      }
    }
  }

  return results
}

/**
 * Encontra o índice do grupo que contém um bloco específico
 */
export const findGroupByBlockId = (
  groups: GroupV6[],
  blockId: string
): { group: GroupV6; groupIndex: number } | undefined => {
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    if (group.blocks.some((block) => block.id === blockId)) {
      return { group, groupIndex: i }
    }
  }
  return undefined
}
