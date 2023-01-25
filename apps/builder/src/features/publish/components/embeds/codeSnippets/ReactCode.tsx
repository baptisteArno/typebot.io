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
import { useTypebot } from '@/features/editor'
import { env, getViewerUrl } from 'utils'
import { CodeEditor } from '@/components/CodeEditor'

type StandardReactDivProps = { widthLabel: string; heightLabel: string }
export const StandardReactDiv = ({
  widthLabel,
  heightLabel,
}: StandardReactDivProps) => {
  const { typebot } = useTypebot()
  const snippet = prettier.format(
    parseContainerSnippet({
      url: `${env('VIEWER_INTERNAL_URL') ?? getViewerUrl()}/${
        typebot?.publicId
      }`,
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
      url: `${env('VIEWER_INTERNAL_URL') ?? getViewerUrl()}/${
        typebot?.publicId
      }`,
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
      url: `${env('VIEWER_INTERNAL_URL') ?? getViewerUrl()}/${
        typebot?.publicId
      }`,
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
