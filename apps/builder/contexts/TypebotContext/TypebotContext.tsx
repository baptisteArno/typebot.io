import { useToast } from '@chakra-ui/react'
import {
  LogicStepType,
  PublicTypebot,
  Settings,
  Theme,
  Typebot,
  Variable,
  Webhook,
} from 'models'
import { Router, useRouter } from 'next/router'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  createPublishedTypebot,
  parsePublicTypebotToTypebot,
  parseTypebotToPublicTypebot,
  updatePublishedTypebot,
} from 'services/publicTypebot'
import {
  checkIfPublished,
  checkIfTypebotsAreEqual,
  parseDefaultPublicId,
  updateTypebot,
} from 'services/typebots/typebots'
import { fetcher, preventUserFromRefreshing } from 'services/utils'
import useSWR from 'swr'
import { isDefined, isEmpty, isNotDefined, omit } from 'utils'
import { BlocksActions, blocksActions } from './actions/blocks'
import { stepsAction, StepsActions } from './actions/steps'
import { variablesAction, VariablesActions } from './actions/variables'
import { edgesAction, EdgesActions } from './actions/edges'
import { useRegisterActions } from 'kbar'
import useUndo from 'services/utils/useUndo'
import { useDebounce } from 'use-debounce'
import { itemsAction, ItemsActions } from './actions/items'
import { dequal } from 'dequal'
import { saveWebhook } from 'services/webhook'
import { stringify } from 'qs'
import cuid from 'cuid'
import { subDomain } from '@octadesk-tech/services'
import { config } from 'config/octadesk.config'

import Agents from 'services/octadesk/agents/agents'
import Groups from 'services/octadesk/groups/groups'
import { ASSIGN_TO } from 'enums/assign-to'
import CustomFields from 'services/octadesk/customFields/customFields'
import { DomainType, FieldType } from '../../enums/customFieldsEnum'
import { fixedPersonProperties } from 'helpers/presets/variables-presets'
import { CustomFieldTitle } from 'enums/customFieldsTitlesEnum'
const autoSaveTimeout = 10000

type UpdateTypebotPayload = Partial<{
  theme: Theme
  settings: Settings
  publicId: string
  name: string
  publishedTypebotId: string
  icon: string
}>

type SaveResponse = {
  saved: boolean
  updatedAt: Date
}

export type SetTypebot = (
  newPresent: Typebot | ((current: Typebot) => Typebot)
) => void
const typebotContext = createContext<
  {
    typebot?: Typebot
    publishedTypebot?: PublicTypebot
    linkedTypebots?: Typebot[]
    webhooks: Webhook[]
    isReadOnly?: boolean
    isPublished: boolean
    isPublishing: boolean
    isSavingLoading: boolean
    save: (
      personaName?: string,
      personaThumbUrl?: string
    ) => Promise<SaveResponse>
    undo: () => void
    redo: () => void
    canRedo: boolean
    canUndo: boolean
    updateWebhook: (
      webhookId: string,
      webhook: Partial<Webhook>
    ) => Promise<void>
    updateTypebot: (updates: UpdateTypebotPayload) => void
    updateOnBothTypebots: (updates: {
      publicId?: string
      name?: string
      customDomain?: string | null
    }) => void
    publishTypebot: () => void
    restorePublishedTypebot: () => void
    octaAgents: Array<any>
    octaPersonFields: Array<any>
    octaChatFields: Array<any>
    octaOrganizationFields: Array<any>
    octaCustomFields: Array<any>
  } & BlocksActions &
  StepsActions &
  ItemsActions &
  VariablesActions &
  EdgesActions
>({} as any)

export const TypebotContext = ({
  children,
  typebotId,
}: {
  children: ReactNode
  typebotId: string
}) => {
  const router = useRouter()
  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const { typebot, publishedTypebot, webhooks, isReadOnly, isLoading, mutate } =
    useFetchedTypebot({
      typebotId,
      onError: (error) =>
        toast({
          title: 'Error while fetching typebot',
          description: error.message,
        }),
    })

  const [
    { present: localTypebot },
    {
      redo,
      undo,
      flush,
      canRedo,
      canUndo,
      set: setLocalTypebot,
      presentRef: currentTypebotRef,
    },
  ] = useUndo<Typebot | undefined>(undefined)

  const linkedTypebotIds = localTypebot?.blocks
    .flatMap((b) => b.steps)
    .reduce<string[]>(
      (typebotIds, step) =>
        step.type === LogicStepType.TYPEBOT_LINK &&
        isDefined(step.options.typebotId)
          ? [...typebotIds, step.options.typebotId]
          : typebotIds,
      []
    )

  const { typebots: linkedTypebots } = useLinkedTypebots({
    workspaceId: localTypebot?.workspaceId ?? undefined,
    typebotId,
    typebotIds: linkedTypebotIds,
    onError: (error) =>
      toast({
        title: 'Error while fetching linkedTypebots',
        description: error.message,
      }),
  })

  useEffect(() => {
    if (!typebot || !currentTypebotRef.current) return
    if (typebotId !== currentTypebotRef.current.id) {
      setLocalTypebot({ ...typebot }, { updateDate: false })
      flush()
    } else if (
      new Date(typebot.updatedAt) >
      new Date(currentTypebotRef.current.updatedAt)
    ) {
      setLocalTypebot({ ...typebot })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typebot])

  const saveTypebot = async (
    personaName?: string,
    personaThumbUrl?: string,
    options?: { disableMutation: boolean }
  ) => {
    const currentSubDomain = subDomain.getSubDomain()

    const typebotToSave = {
      ...currentTypebotRef.current,
      updatedAt: new Date().toISOString(),
      subDomain: currentSubDomain || '',
      persona: {
        name: personaName,
        thumbUrl: personaThumbUrl,
      },
    }

    setIsSavingLoading(true)
    const { error } = await updateTypebot(
      typebotToSave?.id || '',
      typebotToSave as Typebot
    )
    setIsSavingLoading(false)
    if (error) {
      toast({ title: error.name, description: error.message })
      return false
    }

    if (!options?.disableMutation)
      mutate({
        typebot: typebotToSave,
        publishedTypebot,
        webhooks: webhooks ?? [],
      })
    window.removeEventListener('beforeunload', preventUserFromRefreshing)

    return { saved: true, updateAt: typebotToSave.updatedAt }
  }

  const savePublishedTypebot = async (newPublishedTypebot: PublicTypebot) => {
    setIsPublishing(true)
    const { error } = await updatePublishedTypebot(
      newPublishedTypebot.id,
      newPublishedTypebot
    )
    setIsPublishing(false)
    if (error) return toast({ title: error.name, description: error.message })
    mutate({
      typebot: currentTypebotRef.current as Typebot,
      publishedTypebot: newPublishedTypebot,
      webhooks: webhooks ?? [],
    })
  }

  // useAutoSave(
  //   {
  //     handler: saveTypebot,
  //     item: localTypebot,
  //     debounceTimeout: autoSaveTimeout,
  //   },
  //   [typebot, publishedTypebot, webhooks]
  // )

  useEffect(() => {
    const save = () =>
      saveTypebot(typebot?.persona?.name, typebot?.persona?.thumbUrl, {
        disableMutation: true,
      })
    Router.events.on('routeChangeStart', save)
    return () => {
      Router.events.off('routeChangeStart', save)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typebot, publishedTypebot, webhooks])

  const [isSavingLoading, setIsSavingLoading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const isPublished = useMemo(
    () =>
      isDefined(localTypebot) &&
      isDefined(publishedTypebot) &&
      checkIfPublished(localTypebot, publishedTypebot),
    [localTypebot, publishedTypebot]
  )

  useEffect(() => {
    if (!localTypebot || !typebot) return
    currentTypebotRef.current = localTypebot
    if (!checkIfTypebotsAreEqual(localTypebot, typebot)) {
      window.removeEventListener('beforeunload', preventUserFromRefreshing)
      window.addEventListener('beforeunload', preventUserFromRefreshing)
    } else {
      window.removeEventListener('beforeunload', preventUserFromRefreshing)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localTypebot])

  useEffect(() => {
    if (isLoading) return
    if (!typebot) {
      toast({ status: 'info', description: "Couldn't find typebot" })
      router.replace(`${config.basePath || ''}/typebots`)
      return
    }
    setLocalTypebot({ ...typebot })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  useRegisterActions(
    [
      {
        id: 'save',
        name: 'Save typebot',
        perform: () => saveTypebot(),
      },
    ],
    [typebot, publishedTypebot, webhooks]
  )

  useRegisterActions(
    [
      {
        id: 'undo',
        name: 'Undo changes',
        perform: undo,
      },
    ],
    [localTypebot]
  )

  const updateLocalTypebot = (updates: UpdateTypebotPayload) =>
    localTypebot && setLocalTypebot({ ...localTypebot, ...updates })

  const publishTypebot = async () => {
    if (!localTypebot) return
    const publishedTypebotId = cuid()
    const newLocalTypebot = { ...localTypebot }
    if (publishedTypebot && isNotDefined(localTypebot.publishedTypebotId)) {
      updateLocalTypebot({ publishedTypebotId: publishedTypebot.id })
      await saveTypebot()
    }
    if (!publishedTypebot) {
      const newPublicId = parseDefaultPublicId(
        localTypebot.name,
        localTypebot.id
      )
      updateLocalTypebot({ publicId: newPublicId, publishedTypebotId })
      newLocalTypebot.publicId = newPublicId
      await saveTypebot()
    }
    if (publishedTypebot) {
      await savePublishedTypebot({
        ...parseTypebotToPublicTypebot(newLocalTypebot),
        id: publishedTypebot.id,
      })
    } else {
      setIsPublishing(true)
      const { data, error } = await createPublishedTypebot({
        ...parseTypebotToPublicTypebot(newLocalTypebot),
        id: publishedTypebotId,
      })
      setIsPublishing(false)
      if (error) return toast({ title: error.name, description: error.message })
      mutate({
        typebot: localTypebot,
        publishedTypebot: data,
        webhooks: webhooks ?? [],
      })
    }
  }

  const updateOnBothTypebots = async (updates: {
    publicId?: string
    name?: string
    customDomain?: string | null
  }) => {
    updateLocalTypebot(updates)
    await saveTypebot()
    if (!publishedTypebot) return
    await savePublishedTypebot({
      ...publishedTypebot,
      ...updates,
    })
  }

  const restorePublishedTypebot = () => {
    if (!publishedTypebot || !localTypebot) return
    setLocalTypebot(parsePublicTypebotToTypebot(publishedTypebot, localTypebot))
    return saveTypebot()
  }

  const updateWebhook = async (
    webhookId: string,
    updates: Partial<Webhook>
  ) => {
    if (!typebot) return
    const { data } = await saveWebhook(webhookId, updates)
    // console.log('data', data)
    if (data)
      mutate({
        typebot,
        publishedTypebot,
        webhooks: (webhooks ?? []).map((w) =>
          w.id === webhookId ? data.webhook : w
        ),
      })
  }

  const [octaAgents, setOctaAgents] = useState<Array<any>>([])
  useEffect(() => {
    const fetchOctaAgents = async (): Promise<void> => {
      const noOne = {
        group: 'Não atribuir (Visível a todos)',
        name: 'Não atribuir (Visível a todos)',
        operationType: ASSIGN_TO.noOne,
      }
      const agentsGroupsList: Array<any> = [noOne]

      await Promise.all([
        Agents()
          .getAgents()
          .then((res) => {
            let agentsList = res
              .sort((a: any, b: any) => a.name.localeCompare(b.name))
              .map((agent: any) => ({
                ...agent,
                operationType: ASSIGN_TO.agent,
              }))

            agentsList = [
              {
                name: 'Atribuir a conversa para um usuário',
                disabled: true,
                id: 'agent',
                isTitle: true,
              },
              ...agentsList,
            ]

            agentsGroupsList.push(...agentsList)
          }),

        Groups()
          .getGroups()
          .then((res) => {
            let groupsList: Array<any> = []
            const groups = res
              .sort((a: any, b: any) => a.name.localeCompare(b.name))
              .map((group: any) => ({
                ...group,
                operationType: ASSIGN_TO.group,
              }))

            groupsList = [
              {
                name: 'Atribuir a conversa para um grupo',
                id: 'group',
                disabled: true,
                isTitle: true,
              },
              ...groups,
            ]

            agentsGroupsList.push(...groupsList)
          }),
      ])

      setOctaAgents(agentsGroupsList)
    }

    fetchOctaAgents()

    return () => {
      setOctaAgents(() => [])
    }
  }, [])

  const [octaCustomFields, setOctaCustomFields] = useState<Array<any>>([])
  const [octaPersonFields, setOctaPersonFields] = useState<Array<any>>([])
  const [octaChatFields, setOctaChatFields] = useState<Array<any>>([])
  const [octaOrganizationFields, setOctaOrganizationFields] = useState<Array<any>>([])

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
  
  const mountProperties = (properties: any, type: string) => {
    const customProperties = properties.map(
      (h: { fieldType: number; fieldId: string }) => {
        // const type: string = fieldTypes(h.fieldType)
        let tokenValue = `#${h.fieldId.replace(/_/g, '-')}`
        let domainValue = ''
        if (type === 'PERSON') {
          domainValue = CustomFieldTitle.PERSON
          tokenValue = tokenValue.concat('-contato')
        } else if (type === 'CHAT') {
          domainValue = CustomFieldTitle.CHAT
          tokenValue = `#${h.fieldId.replace(/_/g, '-')}`
        } else if (type === 'ORGANIZATION') {
          domainValue = CustomFieldTitle.ORGANIZATION
        }

        const id = 'v' + cuid()

        return {
          type,
          id,
          variableId: id,
          token: tokenValue,
          domain: domainValue,
          name: `customField.${h.fieldId}`,
          example: resolveExample(type),
        }
      }
    )

    return [...customProperties]
  }

  
  useEffect(() => {    
    const fetchOctaCustomFields = async (): Promise<void> => {
      const customFieldsList: Array<any> = []

      const fields = await CustomFields().getCustomFields()
      // handleCustomFields(fields)
      const personFields = [
        ...fixedPersonProperties,
        ...fields.filter(
          (f: { domainType: number }) => f.domainType === DomainType.Person
        ),
      ]
      setOctaPersonFields(personFields)
  
      const chatFields = [
        {
          key: 'id-conversa',
          fieldId: 'id-conversa',
          property: 'room.key',
          type: 'text',
          domainType: DomainType.Chat,
          defaultOnBot: true,
          fieldType: FieldType.Text,
        },
        {
          key: 'primeira-mensagem-cliente',
          fieldId: 'primeira-mensagem-cliente',
          property: 'room.messages[0].comment',
          type: 'text',
          domainType: DomainType.Chat,
          defaultOnBot: true,
          fieldType: FieldType.Text,
        },
        {
          key: 'nome-empresa',
          fieldId: 'nome-empresa',
          property: 'room.organization.name',
          type: 'text',
          domainType: DomainType.Chat,
          defaultOnBot: false,
          fieldType: FieldType.Text,
        },
        {
          key: 'nome-agente',
          fieldId: 'nome-agente',
          property: 'room.agent.name',
          type: 'text',
          domainType: DomainType.Chat,
          defaultOnBot: false,
          fieldType: FieldType.Text,
        },
        ...fields.filter(
          (f: { domainType: number }) => f.domainType === DomainType.Chat
        ),
      ]
      setOctaChatFields(chatFields)
      
  
      const organizationFields = fields.filter(
        (f: { domainType: number }) => f.domainType === DomainType.Organization
      )
      setOctaOrganizationFields(organizationFields)
      customFieldsList.push(...personFields, ...chatFields, ...organizationFields)

      setOctaCustomFields(customFieldsList)
    }

    console.log("OctaCustomFields => \n\n", octaCustomFields);
    

    const items: Array<any> = [];
    const octaChatProperties = mountPropertiesOptions(
      'CHAT',
      mountProperties(octaChatFields, 'CHAT')
    )

    console.log("octaChatProperties => ", octaChatProperties);
    

    if (octaChatProperties) {
      items.push(octaChatProperties.propTitle, ...octaChatProperties.items)
    }

    const octaPersonProperties = mountPropertiesOptions(
      'PERSON',
      mountProperties(octaPersonFields, 'PERSON').filter(
        (p) => p.type !== 'select'
      )
    )

    if (octaPersonProperties) {
      items.push(octaPersonProperties.propTitle, ...octaPersonProperties.items)
    }

    const octaOrganizationProperties = mountPropertiesOptions(
      'ORGANIZATION',
      mountProperties(octaOrganizationFields, 'ORGANIZATION')
    )

    if (octaOrganizationProperties) {
      items.push(
        octaOrganizationProperties.propTitle,
        ...octaOrganizationProperties.items,
      )
    }
    
    fetchOctaCustomFields();

    return () => {
      setOctaCustomFields(() => [])
    }
  }, [typebot])

  return (
    <typebotContext.Provider
      value={{
        typebot: localTypebot,
        publishedTypebot,
        linkedTypebots,
        webhooks: webhooks ?? [],
        isReadOnly,
        isSavingLoading,
        save: saveTypebot,
        undo,
        redo,
        canUndo,
        canRedo,
        publishTypebot,
        isPublishing,
        isPublished,
        updateTypebot: updateLocalTypebot,
        restorePublishedTypebot,
        updateOnBothTypebots,
        updateWebhook,
        ...blocksActions(setLocalTypebot as SetTypebot),
        ...stepsAction(setLocalTypebot as SetTypebot),
        ...variablesAction(setLocalTypebot as SetTypebot),
        ...edgesAction(setLocalTypebot as SetTypebot),
        ...itemsAction(setLocalTypebot as SetTypebot),
        octaAgents,
        octaPersonFields,
        octaChatFields,
        octaOrganizationFields,
        octaCustomFields
      }}
    >
      {children}
    </typebotContext.Provider>
  )
}

export const useTypebot = () => useContext(typebotContext)

export const useFetchedTypebot = ({
  typebotId,
  onError,
}: {
  typebotId: string
  onError: (error: Error) => void
}) => {
  const { data, error, mutate } = useSWR<
    {
      typebot: Typebot
      webhooks: Webhook[]
      publishedTypebot?: PublicTypebot
      isReadOnly?: boolean
    },
    Error
  >(`/getTypebot-${typebotId}`, fetcher, {
    dedupingInterval: isEmpty(process.env.NEXT_PUBLIC_E2E_TEST) ? undefined : 0,
  })
  if (error) onError(error)
  return {
    typebot: data?.typebot,
    webhooks: data?.webhooks,
    publishedTypebot: data?.publishedTypebot,
    isReadOnly: data?.isReadOnly,
    isLoading: !error && !data,
    mutate,
  }
}

const useLinkedTypebots = ({
  workspaceId,
  typebotId,
  typebotIds,
  onError,
}: {
  workspaceId?: string
  typebotId?: string
  typebotIds?: string[]
  onError: (error: Error) => void
}) => {
  const params = stringify({ typebotIds, workspaceId }, { indices: false })
  const { data, error, mutate } = useSWR<
    {
      typebots: Typebot[]
    },
    Error
  >(
    typebotIds?.every((id) => typebotId === id)
      ? undefined
      : `${config.basePath || ''}/api/typebots?${params}`,
    fetcher
  )
  if (error) onError(error)
  return {
    typebots: data?.typebots,
    isLoading: !error && !data,
    mutate,
  }
}

const useAutoSave = <T,>(
  {
    handler,
    item,
    debounceTimeout,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: () => Promise<any>
    item?: T
    debounceTimeout: number
  },
  dependencies: unknown[]
) => {
  const [debouncedItem] = useDebounce(item, debounceTimeout)
  useEffect(() => {
    const save = () => handler()
    document.addEventListener('visibilitychange', save)
    return () => {
      document.removeEventListener('visibilitychange', save)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)
  return useEffect(() => {
    handler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedItem])
}
