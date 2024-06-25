import { createAction, option } from '@typebot.io/forge'
import { isDefined } from '@typebot.io/lib'
import { baseOptions } from '../baseOptions'
import { defaultCortexOptions } from '../constants'
import { auth } from '../auth'

export const cortex = createAction({
  baseOptions,
  name: 'Cortex',
  options: option.object({
    knowledgeBase: option.string.layout({
      label: 'Base de Conhecimento',
      fetcher: 'fetchKBs',
    }),
    cortexUser: option.string.layout({
      label: 'Usuário Cortex',
      fetcher: 'fetchCortexUsers',
    }),
    initialMessage: option.string.layout({
      label: 'MensagemInicial',
      defaultValue: defaultCortexOptions.initialMessage,
    }),
    endCmd: option.string.layout({
      label: 'Comando de fim',
      defaultValue: defaultCortexOptions.endCmd,
    }),
    agentCmd: option.string.layout({
      label: 'Comando de atendimento',
      defaultValue: defaultCortexOptions.agentCmd,
    }),
    retries: option.number.layout({
      label: 'Tentativas',
      defaultValue: defaultCortexOptions.retries,
    }),

    responseMapping: option.string.layout({
      label: 'Salvar resultado',
      inputType: 'variableDropdown',
    }),
  }),
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping ? [responseMapping] : [],
  run: {
    server: async ({ credentials, options, variables }) => {
      let { cortexToken, baseUrl, cortexUrl } = credentials || {}
      const { knowledgeBase, cortexUser } = options
      const initialMessage = options.initialMessage
        ? options.initialMessage
        : defaultCortexOptions.initialMessage
      const endCmd = options.endCmd
        ? options.endCmd
        : defaultCortexOptions.endCmd
      const agentCmd = options.agentCmd
        ? options.agentCmd
        : defaultCortexOptions.agentCmd
      const retries = options.retries
        ? options.retries
        : defaultCortexOptions.retries

      const id_chatbot = variables
        .list()
        .find((v) => v.name === 'is_chatbotid')?.value

      const id_cliente = variables
        .list()
        .find((v) => v.name === 'is_clientid')?.value

      let result = false

      if (
        knowledgeBase &&
        baseUrl &&
        cortexUrl &&
        cortexToken &&
        id_chatbot &&
        id_cliente &&
        initialMessage &&
        endCmd &&
        agentCmd &&
        retries
      ) {
        const parsedUser = JSON.parse(cortexUser!)
        const params = new URLSearchParams({
          page_id: id_chatbot.toString(),
          sender_id: id_cliente.toString(),
          knowledge_base: knowledgeBase.toString(),
          username: parsedUser.email,
          user_id: parsedUser.id,
          initial_message: initialMessage.toString(),
          cmd_fim: endCmd.toString(),
          cmd_atendimento: agentCmd.toString(),
          retry: retries.toString(),
          assistant_token: cortexToken,
          assistant_url: cortexUrl,
          // original_retry: retries.toString(),
        })
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

        if (baseUrl.endsWith('/')) {
          baseUrl = baseUrl.slice(0, -1)
        }
        const url = `${baseUrl}/ivci/webhook/cortex?${params.toString()}`

        const response = await fetch(url, { method: 'POST' })
        if (response.status < 300 && response.status >= 200) {
          // const res = await response.json()
          result = true
        } else {
          console.error(
            'Error in cortex response ',
            response.status,
            response.statusText
          )
          try {
            const res = await response.json()
            console.error('Detailed errors: ', res.detail)
          } catch (e) {}
        }
      } else {
        console.error(
          `Missing Parameters: knowledgeBase: ${knowledgeBase} baseUrl: ${baseUrl} cortexToken: ${cortexToken}  id_chatbot: ${id_chatbot} id_cliente: ${id_cliente} initialMessage: ${initialMessage} endCmd: ${endCmd} agentCmd: ${agentCmd} retries: ${retries}`
        )
      }
    },
    web: {
      displayEmbedBubble: {
        parseUrl: ({}) => '',
        waitForEvent: {
          getSaveVariableId: ({ responseMapping }) => responseMapping,
          parseFunction: () => {
            return {
              args: {},
              content: `
              // https://stackoverflow.com/a/71787772
              function $$$(selector, rootNode=document.body) {
                  const arr = []
                  
                  const traverser = node => {
                      // 1. decline all nodes that are not elements
                      if(node.nodeType !== Node.ELEMENT_NODE) {
                          return
                      }
                      
                      // 2. add the node to the array, if it matches the selector
                      if(node.matches(selector)) {
                          arr.push(node)
                      }
                      
                      // 3. loop through the children
                      const children = node.children
                      if (children.length) {
                          for(const child of children) {
                              traverser(child)
                          }
                      }
                      
                      // 4. check for shadow DOM, and loop through it's children
                      const shadowRoot = node.shadowRoot
                      if (shadowRoot) {
                          const shadowChildren = shadowRoot.children
                          for(const shadowChild of shadowChildren) {
                              traverser(shadowChild)
                          }
                      }
                  }
                  
                  traverser(rootNode)
                  
                  return arr
              }
              window.addEventListener('message', function (event) {
                if (event && 'kwikEvent' in event.data && event.data.kwikEvent === 'close-chat'){
                  continueFlow(event.data.lastMsg);
                  const cortexDiv = $$$("#cortex-div");
                  cortexDiv[0].innerHTML = '';
                }
            })
              `,
            }
          },
        },
        parseInitFunction: ({ options, variables, credentials }) => {
          const { baseUrl } = credentials

          const initialMessage = options.initialMessage
            ? options.initialMessage
            : defaultCortexOptions.initialMessage
          const endCmd = options.endCmd
            ? options.endCmd
            : defaultCortexOptions.endCmd
          const agentCmd = options.agentCmd
            ? options.agentCmd
            : defaultCortexOptions.agentCmd

          const hash = variables
            .list()
            .find((v) => v.name === 'is_contactid')?.value

          const id_chatbot =
            variables.list().find((v) => v.name === 'is_chatbotid')?.value || ''

          const id_cliente =
            variables.list().find((v) => v.name === 'is_clientid')?.value || ''

          const params = new URLSearchParams({
            initial_message: initialMessage.toString(),
            cmd_fim: endCmd.toString(),
            cmd_atendimento: agentCmd.toString(),
            id_chatbot: id_chatbot.toString(),
            id_cliente: id_cliente.toString(),
          })

          const url = `${baseUrl}/builder_chat/${hash}?${params.toString()}`
          return {
            args: {},
            content: `
              typebotElement.style.overflow = 'hidden';
              typebotElement.id = 'cortex-div';
              const iframe = document.createElement('iframe');
              iframe.src = '${url}';
              iframe.id = 'cortex-iframe';
              iframe.style.height = '500px';
              iframe.style.width = '100%';
              typebotElement.appendChild(iframe); 
            `,
          }
        },
      },
    },
  },
  fetchers: [
    {
      id: 'fetchKBs',
      dependencies: ['cortexToken', 'cortexUrl', 'cortexAccountID'],
      fetch: async ({ credentials, options }) => {
        let { cortexAccountID, cortexToken, cortexUrl } = credentials || {}
        if (cortexUrl && cortexToken && cortexAccountID) {
          const queryParams = {
            limit: '20',
            page: '1',
            accountcodeId: cortexAccountID,
            activeVersions: 'true',
            disabledKbs: 'false',
            orderBy: 'name',
          }

          // Convert queryParams to URL search params
          const urlParams = new URLSearchParams(queryParams).toString()

          if (cortexUrl.endsWith('/')) {
            cortexUrl = cortexUrl.slice(0, -1)
          }

          const response = await fetch(
            `${cortexUrl}/ai/knowledge_bases/?${urlParams}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${cortexToken}`,
              },
            }
          )
          if (response.status < 300 && response.status >= 200) {
            const res = await response.json()
            console.log(res.KnowledgeBases)
            const ret = res.KnowledgeBases.map((kb: any) => {
              return {
                label: kb.parsed_name,
                value: kb.id,
              }
            })
            console.log(ret)
            return ret
          }
        }
        return []
      },
    },
    {
      id: 'fetchCortexUsers',
      dependencies: ['cortexToken', 'cortexUrl', 'cortexAccountID'],
      fetch: async ({ credentials, options }) => {
        let { cortexAccountID, cortexToken, cortexUrl } = credentials || {}
        if (cortexUrl && cortexToken && cortexAccountID) {
          const queryParams = {
            limit: '20',
            page: '1',
            accountcodeId: cortexAccountID,
          }

          const urlParams = new URLSearchParams(queryParams).toString()
          if (cortexUrl.endsWith('/')) {
            cortexUrl = cortexUrl.slice(0, -1)
          }

          const response = await fetch(`${cortexUrl}/users/?${urlParams}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${cortexToken}`,
            },
          })

          if (response.status < 300 && response.status >= 200) {
            const res = await response.json()
            const ret = res.Users.map((user: any) => {
              return {
                label: user.name,
                value: JSON.stringify({
                  id: user.id,
                  email: user.email,
                }),
              }
            })
            return ret
          }
        }
        return []
      },
    },
  ],
})
