import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { byId } from 'utils'

import { MemberInWorkspace, Plan, Workspace, WorkspaceRole } from 'model'

import {
  createNewWorkspace,
  useWorkspaces,
  updateWorkspace as patchWorkspace,
  deleteWorkspace,
} from 'services/workspace/workspace'

import { useUser } from './UserContext'

import { useTypebot } from './TypebotContext'

import { useRouter } from 'next/router'

import CustomFields from 'services/octadesk/customFields/customFields'

import { BotsService } from 'services/octadesk/bots/bots'

import { DomainType } from 'enums/customFieldsEnum'

import {
  fixedChatProperties,
  fixedOrganizationProperties,
  fixedPersonProperties,
} from 'helpers/presets/variables-presets'

import { OctaProperty } from 'models'

export type WorkspaceWithMembers = Workspace & { members: MemberInWorkspace[] }

export type ChannelType = {
  name: string
  displayName: string
  proactive: {
    isEnabled: boolean
    needTemplate: boolean
  }
  hoursToAnswer: number
  template: {
    isMediaEnabled: boolean
    isButtonsEnabled: boolean
    isIndexedListEnabled: boolean
    interactionTypes: Array<string>
    categories: Array<string>
    components: {
      body: {
        textStyles: {
          bold: boolean
          italic: boolean
          strikethrough: boolean
          underline: boolean
          emoji: boolean
        }
      }
      footer: {
        textStyles: {
          bold: boolean
          italic: boolean
          strikethrough: boolean
          underline: boolean
          emoji: boolean
          link: boolean
          richText: boolean
        }
      }
      header: {
        textStyles: {
          bold: boolean
          italic: boolean
          strikethrough: boolean
          underline: boolean
          emoji: boolean
          link: boolean
          richText: boolean
        }
      }
      buttons: {
        textStyles: {
          bold: boolean
          italic: boolean
          strikethrough: boolean
          underline: boolean
          emoji: boolean
          link: boolean
          richText: boolean
        }
      }
      list: {
        section: {
          maxQuantity: number
          rows: {
            description: {
              maxLength: number
              textStyles: {
                bold: boolean
                italic: boolean
                strikethrough: boolean
                underline: boolean
                emoji: boolean
                link: boolean
                richText: boolean
              }
            }
            title: {
              maxLength: number
              textStyles: {
                bold: boolean
                italic: boolean
                strikethrough: boolean
                underline: boolean
                emoji: boolean
                link: boolean
                richText: boolean
              }
            }
          }
          title: {
            maxLength: number
            textStyles: {
              bold: boolean
              italic: boolean
              strikethrough: boolean
              underline: boolean
              emoji: boolean
              link: boolean
              richText: boolean
            }
          }
        }
      }
    }
    allowOnlyApproveds: boolean
  }
  supportedExtensions: Array<string>
  bots: {
    exclusiveComponents: Array<string>
  }
  attachmentMaxSize: number
}

export type BotSpecification = {
  id: string
  _id: string
  name: string
  supportedExtensions: Array<string>
  hoursToAnswer: number
  channels: Array<ChannelType>
  active: boolean
}

export type BotSpecificationOption = {
  id: string
  resources: string
  WABA: { name: string; value: number }
  web: { name: string; value: number }
  whatsapp: { name: string; value: number }
  instagram: { name: string; value: number }
  [`facebook-messenger`]: { name: string; value: number }
}

interface IWorkspaceContextData {
  workspaces?: WorkspaceWithMembers[]
  botSpecificationsChannelsInfo: Array<BotSpecificationOption>
  botChannelsSpecifications: Array<string>
  isLoading: boolean
  workspace?: WorkspaceWithMembers
  canEdit: boolean
  switchWorkspace: (workspaceId: string) => void
  createWorkspace: (name?: string) => Promise<void>
  updateWorkspace: (
    workspaceId: string,
    updates: Partial<Workspace>
  ) => Promise<void>
  deleteCurrentWorkspace: () => Promise<void>
  createCustomField: (name: string, domain: string) => Promise<any>
  createChatField: (property: OctaProperty, variableId?: string) => Promise<any>
}

const workspaceContext = createContext<IWorkspaceContextData>(
  {} as IWorkspaceContextData
)

export const WorkspaceContext = ({ children }: { children: ReactNode }) => {
  const { query } = useRouter()

  const { user } = useUser()

  const userId = user?.id

  const { typebot, setVariables } = useTypebot()

  const { workspaces, isLoading, mutate } = useWorkspaces({ userId })

  const [currentWorkspace, setCurrentWorkspace] =
    useState<WorkspaceWithMembers>()

  const canEdit =
    workspaces
      ?.find(byId(currentWorkspace?.id))
      ?.members.find((m) => m.userId === userId)?.role === WorkspaceRole.ADMIN

  useEffect(() => {
    if (!workspaces || workspaces.length === 0 || currentWorkspace) return

    const lastWorspaceId =
      query.workspaceId?.toString() ?? localStorage.getItem('workspaceId')

    const defaultWorkspace = lastWorspaceId
      ? workspaces.find(byId(lastWorspaceId))
      : workspaces.find((w) =>
        w.members.some(
          (m) => m.userId === userId && m.role === WorkspaceRole.ADMIN
        )
      )

    setCurrentWorkspace(defaultWorkspace ?? workspaces[0])
  }, [workspaces])

  useEffect(() => {
    if (!currentWorkspace?.id) return
    localStorage.setItem('workspaceId', currentWorkspace.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace?.id])

  useEffect(() => {
    if (
      !typebot?.workspaceId ||
      !currentWorkspace ||
      typebot.workspaceId === currentWorkspace.id
    ) {
      return
    }

    switchWorkspace(typebot.workspaceId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typebot?.workspaceId])

  const [loaded, setLoaded] = useState(false)

  const [octaPersonFields, setOctaPersonFields] = useState<Array<any>>([])

  const [octaPersonItems, setOctaPersonItems] = useState<Array<any>>([])

  const [octaChatFields, setOctaChatFields] = useState<Array<any>>([])

  const [addedChatFields, setAddedChatFields] = useState<Array<any>>([])

  const [octaChatItems, setOctaChatItems] = useState<Array<any>>([])

  const [octaOrganizationFields, setOctaOrganizationFields] = useState<
    Array<any>
  >([])

  const [octaOrganizationItems, setOctaOrganizationItems] = useState<
    Array<any>
  >([])

  const [botSpecificationsChannelsInfo, setBotSpecificationsChannelsInfo] =
    useState<Array<BotSpecificationOption>>([])

  const [botChannelsSpecifications, setBotChannelsSpecifications] = useState<
    Array<string>
  >([''])

  const [fieldsCreated, setFieldsCreated] = useState<Array<string>>([])

  const translatedKeys = {
    bold: 'Negrito',
    italic: 'Itálico',
    lineThrough: 'Tachado',
    underline: 'Sublinhado',
    emoji: 'Emoji',
    hoursToAnswer: 'Definir horário de atendimento do bot',
    attachmentMaxSize: 'Tamanho do anexo',
    supportedExtensions: 'Arquivos permitidos',
    exclusiveComponents: 'Arquivos e interações',
  }

  const fetchBotSpecifications = useCallback(async (): Promise<void> => {
    const botSpecifications = await BotsService().getBotSpecifications()

    setChannelsSpecifications(botSpecifications)
  }, [])

  useEffect(() => {
    fetchBotSpecifications()
  }, [fetchBotSpecifications])

  const setChannelsInfoSpecifications = (
    channels: Array<string>,
    channelsSpecifications: Array<ChannelType>
  ) => {
    const resources = [
      'template.components.body.textStyles.bold',
      'template.components.body.textStyles.italic',
      'template.components.body.textStyles.lineThrough',
      'template.components.body.textStyles.underline',
      'template.components.body.textStyles.emoji',
      'hoursToAnswer',
      'attachmentMaxSize',
      'supportedExtensions',
      'bots.exclusiveComponents',
    ]

    const getMultiLevelProp = (obj: any, keys: any) => {
      return keys.split('.').reduce((cur: any, key: any) => {
        return cur[key]
      }, obj)
    }

    const getValue = (channelName: any, key: any) => {
      let value = ''

      channelsSpecifications.forEach((channel) => {
        if (channel.displayName === channelName) {
          value = getMultiLevelProp(channel, key)
        }
      })

      return value
    }

    const options: Array<BotSpecificationOption> = resources.map((resource) => {
      const key = resource.split('.').pop() || ''

      return {
        id: key,
        resources: (translatedKeys as any)[key],
        ...channels.reduce(
          (acc: any, channelName: any) => (
            (acc[channelName] = {
              name: channelName,
              value: getValue(channelName, resource),
            }),
            acc
          ),
          {}
        ),
      }
    })

    setBotSpecificationsChannelsInfo(options)
  }

  const setChannelsSpecifications = (
    specifications: Array<BotSpecification>
  ) => {
    const channels: Array<string> = []

    const channelsSpecifications: Array<ChannelType> = []

    if (specifications) {
      specifications.forEach((integrators) => {
        integrators.channels.forEach((channel) => {
          channels.push(channel.displayName)

          channelsSpecifications.push({ ...channel })
        })
      })
    }

    setBotChannelsSpecifications(channels)

    setChannelsInfoSpecifications(channels, channelsSpecifications)
  }

  const mountPropertiesOptions = useCallback(
    (propertiesType: any, properties: any) => {
      return { items: properties }
    },
    []
  )

  const resolveExample = (type: any) => {
    switch (type) {
      case 'string':
        return 'Qualquer texto'
      case 'boolean':
        return 'sim ou não'
      case 'number':
        return '10203040'
      case 'decimal':
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
        return 'decimal'
      case 7:
        return 'date'
      default:
        return 'string'
    }
  }

  const mountProperties = (properties: any, domainType: string) => {
    const customProperties = properties.map(
      (h: {
        id: string
        fieldType: number,
        type: number,
        fieldId: string
        fixed: boolean
      }) => {
        const fieldType: string = fieldTypes(h.fieldType || h.type)
        let tokenValue = `#${h.fieldId.replace(/_/g, '-')}`

        if (domainType === 'PERSON') {
          tokenValue = tokenValue.concat('-contato')
        } else if (domainType === 'ORGANIZATION') {
          tokenValue = tokenValue.concat('-organizacao')
        }

        return {
          type: fieldType,
          id: h.id,
          variableId: h.id,
          token: tokenValue,
          domain: domainType,
          name: `customField.${h.fieldId}`,
          example: resolveExample(fieldType),
          fixed: h.fixed,
        }
      }
    )

    return [...customProperties]
  }

  const fixedChatPropertiesWithId = fixedChatProperties.map((chatProperty) => {
    return {
      ...chatProperty,
      variableId: chatProperty.id,
      fixed: true,
    }
  })

  const fixedPersonPropertiesWithId = fixedPersonProperties.map(
    (personProperty) => {
      return {
        ...personProperty,
        variableId: personProperty.id,
        fixed: true,
      }
    }
  )

  const fixedOrganizationPropertiesWithId = fixedOrganizationProperties.map(
    (organizationProperty) => {
      return {
        ...organizationProperty,
        variableId: organizationProperty.id,
        fixed: true,
      }
    }
  )

  const createChatField = useCallback(
    (property: OctaProperty, variableId?: string): any => {
      if (octaChatFields.find((c) => c.token === property.token)) return
      const field = {
        type: property.type,
        id: variableId,
        variableId,
        token: property.token,
        domain: 'CHAT',
        name: 'customField.' + property.name,
        fieldId: property.name,
      }

      setOctaChatFields([...octaChatFields, field])

      setAddedChatFields([...addedChatFields, field])
    },
    [addedChatFields, octaChatFields]
  )

  const fetchOctaCustomFields = useCallback(
    async (domain?: string): Promise<void> => {
      setLoaded(false)

      const fields = await CustomFields().getCustomFields()
      if (!domain || domain === 'PERSON') {
        const personFields = fields.filter(
          (f: { domainType: number }) => f.domainType === DomainType.Person
        )

        setOctaPersonFields(personFields)
      }

      if (!domain || domain === 'CHAT') {
        const chatFields = fields.filter(
          (f: { domainType: number }) => f.domainType === DomainType.Chat
        )

        setOctaChatFields([...chatFields, ...addedChatFields])
      }

      if (!domain || domain === 'ORGANIZATION') {
        const organizationFields = fields.filter(
          (f: { domainType: number }) =>
            f.domainType === DomainType.Organization
        )

        setOctaOrganizationFields(organizationFields)
      }

      setLoaded(true)
    },
    [addedChatFields]
  )

  const createCustomField = useCallback(
    async (name: string, domain: string): Promise<any> => {
      const key = `${name}:${domain}`
      if (fieldsCreated.includes(key)) return

      const payload = {
        domainType: 2,
        fieldId: name,
        isEnabled: true,
        order:
          typebot?.variables?.filter((v) => v.domain === domain)?.length || 0,
        systemType: 2,
        title: name,
        type: 1,
      }
      await CustomFields().createCustomField(payload)

      //createCustomField({ ...property, id: variableId, variableId } as Variable)

      setFieldsCreated([...fieldsCreated, key])

      setLoaded(false)

      return fetchOctaCustomFields(domain)
    },
    [fetchOctaCustomFields, fieldsCreated, typebot?.variables]
  )

  useEffect(() => {
    fetchOctaCustomFields()
  }, [])

  useEffect(() => {
    if (loaded && setVariables) {
      const variables = [
        ...octaPersonItems,
        ...octaChatItems,
        ...octaOrganizationItems,
      ]

      if (typebot?.variables.length === variables.length) return
      setVariables(variables)
    }
  }, [loaded, octaPersonItems, octaChatItems, octaOrganizationItems])

  useEffect(() => {
    if (octaPersonFields) {
      const octaPersonProperties = mountPropertiesOptions(
        'PERSON',
        mountProperties(octaPersonFields, 'PERSON')
      )

      if (octaPersonProperties) {
        setOctaPersonItems([
          ...fixedPersonPropertiesWithId,
          ...octaPersonProperties.items,
        ])
      }
    }
  }, [octaPersonFields])

  useEffect(() => {
    if (octaChatFields) {
      const octaChatProperties = mountPropertiesOptions(
        'CHAT',
        mountProperties(octaChatFields, 'CHAT')
      )

      if (octaChatProperties) {
        setOctaChatItems([
          ...fixedChatPropertiesWithId,
          ...octaChatProperties.items,
        ])
      }
    }
  }, [octaChatFields])

  useEffect(() => {
    if (octaOrganizationFields) {
      const octaOrganizationProperties = mountPropertiesOptions(
        'ORGANIZATION',
        mountProperties(octaOrganizationFields, 'ORGANIZATION')
      )

      if (octaOrganizationProperties) {
        setOctaOrganizationItems([
          ...fixedOrganizationPropertiesWithId,
          ...octaOrganizationProperties.items,
        ])
      }
    }
  }, [octaOrganizationFields])

  useEffect(() => {
    const fluxChannel = document.referrer.split('/')

    const channel = query?.channel ?? (fluxChannel[5] || 'web')

    setCurrentWorkspace((current): any => ({ ...current, channel } as any))
  }, [])

  const switchWorkspace = useCallback(
    (workspaceId: string) => {
      setCurrentWorkspace(workspaces?.find(byId(workspaceId)))
    },
    [workspaces]
  )

  const createWorkspace = useCallback(
    async (name?: string) => {
      if (!workspaces) return

      const { data, error } = await createNewWorkspace({
        name: name ? `${name}'s workspace` : 'My workspace',
        plan: Plan.FREE,
      })

      if (error || !data) return

      const { workspace } = data

      const newWorkspace = {
        ...workspace,
        members: [
          {
            role: WorkspaceRole.ADMIN,
            userId: userId as string,
            workspaceId: workspace.id as string,
          },
        ],
      }

      mutate({
        workspaces: [...workspaces, newWorkspace],
      })

      setCurrentWorkspace(newWorkspace)
    },
    [mutate, userId, workspaces]
  )

  const updateWorkspace = useCallback(
    async (workspaceId: string, updates: Partial<Workspace>) => {
      const { data } = await patchWorkspace({ id: workspaceId, ...updates })

      if (!data || !currentWorkspace) return

      setCurrentWorkspace({ ...currentWorkspace, ...updates })

      mutate({
        workspaces: (workspaces ?? []).map((w) =>
          w.id === workspaceId ? { ...data.workspace, members: w.members } : w
        ),
      })
    },
    [currentWorkspace, mutate, workspaces]
  )

  const deleteCurrentWorkspace = useCallback(async () => {
    if (!currentWorkspace || !workspaces || workspaces.length < 2) return

    const { data } = await deleteWorkspace(currentWorkspace.id)

    if (!data || !currentWorkspace) return

    setCurrentWorkspace(workspaces[0])

    mutate({
      workspaces: (workspaces ?? []).filter((w) =>
        w.id === currentWorkspace.id
          ? { ...data.workspace, members: w.members }
          : w
      ),
    })
  }, [currentWorkspace, mutate, workspaces])

  const value = useMemo(
    () => ({
      workspaces,
      botSpecificationsChannelsInfo,
      botChannelsSpecifications,
      workspace: currentWorkspace,
      isLoading,
      canEdit,
      switchWorkspace,
      createWorkspace,
      deleteCurrentWorkspace,
      createCustomField,
      updateWorkspace,
      createChatField,
    }),
    [
      workspaces,
      botSpecificationsChannelsInfo,
      botChannelsSpecifications,
      currentWorkspace,
      isLoading,
      canEdit,
      switchWorkspace,
      createWorkspace,
      deleteCurrentWorkspace,
      createCustomField,
      updateWorkspace,
      createChatField,
    ]
  )

  return (
    <workspaceContext.Provider value={value}>
      {children}
    </workspaceContext.Provider>
  )
}

export const useWorkspace = (): IWorkspaceContextData => {
  const context = useContext(workspaceContext)

  if (!context) {
    throw new Error('useWorkspace must be used within an useWorkspaceProvider')
  }

  return context
}
