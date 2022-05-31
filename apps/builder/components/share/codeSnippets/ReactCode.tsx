import { FlexProps } from '@chakra-ui/react'
import React from 'react'
import { BubbleParams, IframeParams, PopupParams } from 'typebot-js'
import {
  parseInitBubbleCode,
  parseInitContainerCode,
  parseInitPopupCode,
} from './params'
import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import { CodeEditor } from 'components/shared/CodeEditor'
import { useTypebot } from 'contexts/TypebotContext'
import { isEmpty } from 'utils'

type StandardReactDivProps = { widthLabel: string; heightLabel: string }
export const StandardReactDiv = ({
  widthLabel,
  heightLabel,
}: StandardReactDivProps) => {
  const { typebot } = useTypebot()
  const snippet = prettier.format(
    parseContainerSnippet({
      url: `${
        isEmpty(process.env.NEXT_PUBLIC_VIEWER_INTERNAL_URL)
          ? process.env.NEXT_PUBLIC_VIEWER_URL
          : process.env.NEXT_PUBLIC_VIEWER_INTERNAL_URL
      }/${typebot?.publicId}`,
      heightLabel,
      widthLabel,
    }),
    {
      parser: 'babel',
      plugins: [parserBabel],
    }
  )
  return <CodeEditor value={snippet} lang="js" isReadOnly />
}

type SnippetProps = IframeParams &
  Pick<StandardReactDivProps, 'widthLabel' | 'heightLabel'>

const parseContainerSnippet = ({
  url,
  customDomain,
  backgroundColor,
  hiddenVariables,
  ...embedProps
}: SnippetProps): string => {
  const jsCode = parseInitContainerCode({
    url,
    customDomain,
    backgroundColor,
    hiddenVariables,
  })
  return `import Typebot from "typebot-js";

      const Component = () => {
        useEffect(()=> {
          ${jsCode}
        }, [])

        return <div id="typebot-container" style={{width: "${embedProps.widthLabel}", height: "${embedProps.heightLabel}"}} />
      }`
}

type PopupEmbedCodeProps = {
  delay?: number
  withStarterVariables?: boolean
}

export const PopupReactCode = ({ delay }: PopupEmbedCodeProps & FlexProps) => {
  const { typebot } = useTypebot()
  const snippet = prettier.format(
    parsePopupSnippet({
      url: `${
        isEmpty(process.env.NEXT_PUBLIC_VIEWER_INTERNAL_URL)
          ? process.env.NEXT_PUBLIC_VIEWER_URL
          : process.env.NEXT_PUBLIC_VIEWER_INTERNAL_URL
      }/${typebot?.publicId}`,
      delay,
    }),
    {
      parser: 'babel',
      plugins: [parserBabel],
    }
  )
  return <CodeEditor value={snippet} lang="js" isReadOnly />
}

const parsePopupSnippet = ({
  url,
  customDomain,
  backgroundColor,
  hiddenVariables,
  delay,
}: PopupParams): string => {
  const jsCode = parseInitPopupCode({
    url,
    customDomain,
    backgroundColor,
    hiddenVariables,
    delay,
  })
  return `import Typebot from "typebot-js";

      const Component = () => {
        useEffect(()=> {
          ${jsCode}
        }, [])

        return <></>;
      }`
}

type ChatEmbedCodeProps = {
  withStarterVariables?: boolean
} & Pick<BubbleParams, 'button' | 'proactiveMessage'>

export const ChatReactCode = ({
  proactiveMessage,
  button,
}: ChatEmbedCodeProps & FlexProps) => {
  const { typebot } = useTypebot()
  const snippet = prettier.format(
    parseBubbleSnippet({
      url: `${
        isEmpty(process.env.NEXT_PUBLIC_VIEWER_INTERNAL_URL)
          ? process.env.NEXT_PUBLIC_VIEWER_URL
          : process.env.NEXT_PUBLIC_VIEWER_INTERNAL_URL
      }/${typebot?.publicId}`,
      button,
      proactiveMessage,
    }),
    {
      parser: 'babel',
      plugins: [parserBabel],
    }
  )
  return <CodeEditor value={snippet} lang="js" isReadOnly />
}

const parseBubbleSnippet = ({
  url,
  customDomain,
  backgroundColor,
  hiddenVariables,
  proactiveMessage,
  button,
}: BubbleParams): string => {
  const jsCode = parseInitBubbleCode({
    url,
    customDomain,
    backgroundColor,
    hiddenVariables,
    proactiveMessage,
    button,
  })
  return `import Typebot from "typebot-js";

      const Component = () => {
        useEffect(()=> {
          ${jsCode}
        }, [])

        return <></>
      }`
}
