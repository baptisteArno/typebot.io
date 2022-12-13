import { Flex } from '@chakra-ui/layout'
import { Seo } from 'components/Seo'
//import hash from 'object-hash'
import {
  EditorContext,
  RightPanel as RightPanelEnum,
  useEditor,
} from 'contexts/EditorContext'
import { useEffect, useRef, useState, useMemo } from 'react'
import { KBar } from 'components/shared/KBar'
import { BoardMenuButton } from 'components/editor/BoardMenuButton'
import { PreviewDrawer } from 'components/editor/preview/PreviewDrawer'
import { StepsSideBar } from 'components/editor/StepsSideBar'
import { Graph } from 'components/shared/Graph'
import { GraphProvider } from 'contexts/GraphContext'
import { GraphDndContext } from 'contexts/GraphDndContext'
import { useTypebot } from 'contexts/TypebotContext'
import { GettingStartedModal } from 'components/editor/GettingStartedModal'

import { CustomFieldTitle } from 'enums/customFieldsTitlesEnum'
import CustomFields from 'services/octadesk/customFields/customFields'
import { DomainType } from 'enums/customFieldsEnum'
import cuid from 'cuid'
import {
  fixedChatProperties,
  fixedOrganizationProperties,
  fixedPersonProperties,
} from 'helpers/presets/variables-presets'

function TypebotEditPage() {
  const { typebot, isReadOnly, save, createVariable, deleteVariable } = useTypebot()

  const [typebotInitialUpdatedAt, setTypebotInitialUpdatedAt] =
    useState<any>(null)
  const updatedTypebot = useRef(false)

  useEffect(() => {
    window.addEventListener('message', handleEventListeners)

    return () => window.removeEventListener('message', handleEventListeners)
  }, [])

  useEffect(() => {
    if (updatedTypebot.current) return

    if (typebot && !typebotInitialUpdatedAt) {
      setTypebotInitialUpdatedAt(typebot.updatedAt)
    } else if (typebot && typebot.updatedAt !== typebotInitialUpdatedAt) {
      updatedTypebot.current = true
    }
    console.log('useEffect')
  }, [typebot])

  const [octaCustomProperties, setOctaCustomProperties] = useState<Array<any>>(
    []
  )
  const [octaPersonFields, setOctaPersonFields] = useState<Array<any>>([])
  const [octaChatFields, setOctaChatFields] = useState<Array<any>>([])
  const [octaOrganizationFields, setOctaOrganizationFields] = useState<
    Array<any>
  >([])

  const mountPropertiesOptions = (propertiesType: any, properties: any) => {
    let nameTokenValue = ''
    if (propertiesType === 'PERSON') {
      nameTokenValue = CustomFieldTitle.PERSON
    } else if (propertiesType === 'CHAT') {
      nameTokenValue = CustomFieldTitle.CHAT
    } else if (propertiesType === 'ORGANIZATION') {
      nameTokenValue = CustomFieldTitle.ORGANIZATION
    }

    const propTitle = {
      id: nameTokenValue,
      token: nameTokenValue,
      name: nameTokenValue,
      isTitle: true,
      disabled: true,
    }
    return { propTitle, items: properties }
  }

  const resolveExample = (type: any) => {
    switch (type) {
      case 'string':
        return 'Qualquer texto'
      case 'boolean':
        return 'sim ou não'
      case 'number':
        return '10203040'
      case 'float':
        return '1020,40'
      case 'date':
        return '13/01/0001'
    }

    return ''
  }

  const fieldTypes = (fieldType: number): string => {
    switch (fieldType) {
      case 4:
        return 'boolean'
      case 5:
        return 'number'
      case 6:
        return 'float'
      case 7:
        return 'date'
      default:
        return 'string'
    }
  }

  const mountProperties = (properties: any, domainType: string) => {
    const customProperties = properties.map(
      (h: { fieldType: number; fieldId: string }) => {
        const fieldType: string = fieldTypes(h.fieldType)
        let tokenValue = `#${h.fieldId.replace(/_/g, '-')}`
        if (domainType === 'PERSON') {
          tokenValue = tokenValue.concat('-contato')
        } else if (domainType === 'CHAT') {
          tokenValue = `#${h.fieldId.replace(/_/g, '-')}`
        } else if (domainType === 'ORGANIZATION') {
        }

        const id = 'v' + cuid()

        return {
          type: fieldType,
          id,
          variableId: id,
          token: tokenValue,
          domain: domainType,
          name: `customField.${h.fieldId}`,
          example: resolveExample(fieldType),
        }
      }
    )

    return [...customProperties]
  }

  const variables = useMemo(() => (typebot ? typebot.variables : []), [typebot])
  
  const fixedChatPropertiesWithId = fixedChatProperties.map(chatProperty => {
    return {
      ...chatProperty,
      id: cuid()
    }
  })
  const fixedPersonPropertiesWithId = fixedPersonProperties.map(personProperty => {
    return {
      ...personProperty,
      id: cuid()
    }
  })
  const fixedOrganizationPropertiesWithId = fixedOrganizationProperties.map(organizationProperty => {
    return {
      ...organizationProperty,
      id: cuid()
    }
  })
  const items: Array<any> = []
  useEffect(() => {
    const fetchOctaCustomFields = async (): Promise<void> => {
      const customFieldsList: Array<any> = []

      const fields = await CustomFields().getCustomFields()
      const personFields = fields.filter(
        (f: { domainType: number }) => f.domainType === DomainType.Person
      )
      setOctaPersonFields(personFields)

      const chatFields = fields.filter(
        (f: { domainType: number }) => f.domainType === DomainType.Chat
      )

      setOctaChatFields(chatFields)

      const organizationFields = fields.filter(
        (f: { domainType: number }) => f.domainType === DomainType.Organization
      )
      setOctaOrganizationFields(organizationFields)
      customFieldsList.push(
        ...personFields,
        ...chatFields,
        ...organizationFields
      )

      setOctaCustomProperties(customFieldsList)
    }

    const octaChatProperties = mountPropertiesOptions(
      'CHAT',
      mountProperties(octaChatFields, 'CHAT')
    )

    if (octaChatProperties) {
      items.push(
        octaChatProperties.propTitle,
        ...octaChatProperties.items,
        ...fixedChatPropertiesWithId
      )
    }

    const octaPersonProperties = mountPropertiesOptions(
      'PERSON',
      mountProperties(octaPersonFields, 'PERSON').filter(
        (p) => p.type !== 'select'
      )
    )

    if (octaPersonProperties) {
      items.push(
        octaPersonProperties.propTitle,
        ...octaPersonProperties.items,
        ...fixedPersonPropertiesWithId
      )
    }

    const octaOrganizationProperties = mountPropertiesOptions(
      'ORGANIZATION',
      mountProperties(octaOrganizationFields, 'ORGANIZATION')
    )

    if (octaOrganizationProperties) {
      items.push(
        octaOrganizationProperties.propTitle,
        ...octaOrganizationProperties.items,
        ...fixedOrganizationPropertiesWithId
      )
    }

    setOctaCustomProperties(items)
    console.log('items\n', items)

    console.log('variables\n', variables)
    variables.map((variable) => deleteVariable(variable.id))
    if (typebot && createVariable && variables) {
      items.map((item) => {
        console.log(item)
        createVariable(item)
      })
    }

    console.log('variables after\n', variables)

    fetchOctaCustomFields()

    return () => {
      setOctaCustomProperties(() => [])
    }
  }, [])

  const handleEventListeners = (e: any): void => {
    if (e.data === 'backClick') {
      if (updatedTypebot.current) {
        const botEditedMessage = Object.assign({
          name: 'botEditedCannotSave',
        })

        window.parent.postMessage(botEditedMessage, '*')
      } else {
        const canGoBack = Object.assign({
          name: 'canGoBack',
        })

        window.parent.postMessage(canGoBack, '*')
      }
    }
    if (e.data.name === 'saveClick') {

      save(e.data.personaName, e.data.personaThumbUrl).then((res) => {
        if (res.saved) {
          updatedTypebot.current = false
          setTypebotInitialUpdatedAt(res.updatedAt)

          const data = Object.assign({
            name: 'successSave',
          })

          window.parent.postMessage(data, '*')
        } else {
          const data = Object.assign({
            name: 'failedToSave',
          })

          window.parent.postMessage(data, '*')
        }
      })
    }
  }

  return !typebot ? (
    <></>
  ) : (
    <>
      <EditorContext>
        <Seo title="Editor" />
        <KBar />
        <Flex overflow="clip" h="100vh" flexDir="column" id="editor-container">
          <GettingStartedModal />
          <Flex
            flex="1"
            pos="relative"
            h="full"
            background="#f4f5f8"
            backgroundImage="radial-gradient(#c6d0e1 1px, transparent 0)"
            backgroundSize="40px 40px"
            backgroundPosition="-19px -19px"
          >
            <GraphDndContext>
              <StepsSideBar />
              <GraphProvider
                blocks={typebot?.blocks ?? []}
                isReadOnly={isReadOnly}
              >
                {typebot && <Graph flex="1" typebot={typebot} />}
                <BoardMenuButton pos="absolute" right="40px" top="20px" />
                <RightPanel />
              </GraphProvider>
            </GraphDndContext>
          </Flex>
        </Flex>
      </EditorContext>
    </>
  )
}

const RightPanel = () => {
  const { rightPanel } = useEditor()
  return rightPanel === RightPanelEnum.PREVIEW ? <PreviewDrawer /> : <></>
}

export default TypebotEditPage
