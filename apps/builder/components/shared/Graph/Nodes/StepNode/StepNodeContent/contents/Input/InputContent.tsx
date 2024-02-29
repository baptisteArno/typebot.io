import { InputOptions, Variable } from 'models'
import React, { useEffect } from 'react'
import { Stack } from '@chakra-ui/react'
import { WithVariableContent } from '../WithVariableContent'
import { useTypebot } from 'contexts/TypebotContext'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { useWorkspace } from 'contexts/WorkspaceContext'
import { TextHtmlContent } from '../TextHtmlContent'

type Props = {
  step: {
    type: string
    options: InputOptions
  },
  onUpdateStep: (options: InputOptions) => void
}

const InputContent = ({ step, onUpdateStep }: Props) => {
  const { typebot } = useTypebot()
  const { createCustomField } = useWorkspace()

  const handleDefaultTokenNotFound = async () => {
    if (step.options.initialVariableToken) {
      const splitedToken = step.options.initialVariableToken?.split('-')
      if (splitedToken) {
        const lastPortion = splitedToken.pop()
        const domain = lastPortion === 'contato' ? 'PERSON' : lastPortion === 'organizacao' ? 'ORGANIZATION' : ''
        const name = splitedToken.join('-').replace(/#/g, '')

        if (domain) {
          const domainVariables = typebot?.variables?.filter(v => v.domain === domain)

          if (domainVariables) {
            const domainProperty = domainVariables.find(
              property => property.name === name || property.name === 'customField.' + name
            )

            if (!domainProperty) createCustomField(name, domain)
          }
        }
      }
    }
  }

  const handleVariableChange = (variable: Variable) => {
    if (variable) {
      onUpdateStep({
        ...step.options, variableId: variable?.id, property: {
          domain: variable.domain,
          name: variable.name,
          type: variable.type ? variable.type : "string",
          token: variable.token
        }
      })
    }
  }

  useEffect(() => {
    if (!step.options.variableId && step.options.initialVariableToken) {
      let myVariable = typebot?.variables?.find(v => v.token === step.options.initialVariableToken)
      if (myVariable) {
        step.options.variableId = myVariable.id
        handleVariableChange(myVariable)
      } else {
        handleDefaultTokenNotFound()
      }
    }
  }, [typebot?.variables])



  if (!step.options.variableId && step.options.initialVariableToken) {
    let myVariable = typebot?.variables?.find(v => v.token === step.options.initialVariableToken)
    if (myVariable) {
      step.options.variableId = myVariable.id
      handleVariableChange(myVariable)
    }
  }

  return (
    <Stack>
      <TextHtmlContent html={step?.options?.message?.html} />

      <OctaDivider />
      <WithVariableContent variableId={step.options?.variableId} property={step.options?.property} />
    </Stack>
  )
}

export default InputContent