import { createAction, option } from '@typebot.io/forge'
import { isDefined } from '@typebot.io/lib'
import { baseOptions } from '../baseOptions'

const parseQueueName = (queue: string) => {
  const queueName = queue.split('_')[1]
  return queueName
}

export const queueJoin = createAction({
  name: 'Queue join',
  baseOptions,
  options: option.object({
    queue: option.string.layout({
      label: 'Queue ID',
      fetcher: 'fetchQueues',
      moreInfoTooltip:
        'Informe o código da fila ou escolha a variável que contém essa informação.',
    }),
    // responseMapping: option.saveResponseArray(['Message'] as const).layout({
    //   accordion: 'Save response',
    queueVar: option.string.layout({
      accordion: 'Avançado',
      label: 'Queue Var',
      isRequired: false,
      withVariableButton: true,
    }),
    // }),
    responseMapping: option.string.layout({
      label: 'Save response',
      inputType: 'variableDropdown',
    }),
  }),
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping ? [responseMapping] : [],
  // responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
  run: {
    server: async ({
      options: { queue, queueVar, responseMapping },
      variables,
      credentials,
    }) => {
      const { baseUrl } = credentials
      const id_chatbot = variables
        .list()
        .find((v) => v.name === 'id_chatbot')?.value
      const id_cliente = variables
        .list()
        .find((v) => v.name === 'id_cliente')?.value
      const queueId = queueVar ? queueVar : queue
      console.log('Going to call queue ', queueId)
      const url = `${baseUrl}/ivci/webhook/queue_join?queue=${queueId}&page_id=${id_chatbot}&sender_id=${id_cliente}`
      const response = await fetch(url, { method: 'POST' })
      if (response.status < 300 && response.status >= 200) {
        const res = await response.json()
      }
    },
    web: {
      displayEmbedBubble: {
        waitForEvent: {
          getSaveVariableId: ({ responseMapping }) => responseMapping,
          parseFunction: () => {
            return {
              args: {},
              content: `
              function showNotification() {

                function createNotification() {
                  const notification = new Notification("Nova mensagem!", {
                    'body': "Você recebeu uma nova mensagem."
                  });
                }

                if (!("Notification" in window)) {
                    console.error("This browser do not suport notifications.");
                    return;
                }

                if (Notification.permission !== 'granted') {
                    console.log("solicitando permissão")
                    Notification.requestPermission().then((permission) => {
                        if (permission === 'granted') {
                          createNotification();
                        }
                    });
                } else {
                    createNotification();
                }
              }

              window.addEventListener('message', function (event) {
                if (event && 'kwikEvent' in event.data && event.data.kwikEvent === 'close-chat'){
                  continueFlow('Chat encerrado pelo operador');
                }
                if (event && 'webchatEvent' in event.data && event.data.webchatEvent === 'show-notification'){
                  showNotification();
                }
              });
              `,
            }
          },
        },
        parseInitFunction: ({ options, variables, credentials }) => {
          const { baseUrl } = credentials
          const hash = variables
            .list()
            .find((v) => v.name === 'id_atendimento')?.value
          const url = `${baseUrl}/builder_chat/${hash}/`
          return {
            args: {},
            content: `
              typebotElement.style.overflow = 'hidden';
              const iframe = document.createElement('iframe');
              iframe.src = '${url}';
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
      id: 'fetchQueues',
      dependencies: ['baseUrl', 'accountcode', 'wsKey'],
      fetch: async ({ credentials, options }) => {
        const { baseUrl, accountcode, wsKey } = credentials

        if (baseUrl && accountcode && wsKey) {
          const body = {
            AccountcodesQueuesInfo: {
              key: wsKey,
              accountcodes: [accountcode],
              media: 'c',
            },
          }

          const response = await fetch(`${baseUrl}/ivws/instantrest`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          })
          if (response.status < 300 && response.status >= 200) {
            const res = await response.json()
            if (res.AccountcodesQueuesInfoResult0 == 0) {
              return res.AccountcodesQueuesInfoResult2.map((q: any) => ({
                label: `${parseQueueName(q.name)}: ${q.description}`,
                value: parseQueueName(q.name),
              }))
            }
          }
        }
        return []
      },
    },
  ],
})
