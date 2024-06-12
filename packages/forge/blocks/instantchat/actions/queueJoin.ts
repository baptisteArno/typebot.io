import { createAction, option } from '@typebot.io/forge'
import { isDefined } from '@typebot.io/lib'
import { baseOptions } from '../baseOptions'
import { fetchQueues } from '../fetchers/fetchQueues'

export const queueJoin = createAction({
  name: 'Fila',
  baseOptions,
  options: option.object({
    queue: option.string.layout({
      label: 'Fila',
      fetcher: 'fetchQueues',
      moreInfoTooltip:
        'Informe o código da fila ou escolha a variável que contém essa informação.',
    }),
    // responseMapping: option.saveResponseArray(['Message'] as const).layout({
    //   accordion: 'Save response',
    queueVar: option.string.layout({
      accordion: 'Avançado',
      label: 'Variável',
      isRequired: false,
      withVariableButton: true,
    }),
    // }),
    responseMapping: option.string.layout({
      label: 'Salvar resultado',
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
        .find((v) => v.name === 'is_chatbotid')?.value
      const id_cliente = variables
        .list()
        .find((v) => v.name === 'is_clientid')?.value
      const queueId = queueVar ? queueVar : queue
      const url = `${baseUrl}/ivci/webhook/queue_join?queue=${queueId}&page_id=${id_chatbot}&sender_id=${id_cliente}`
      const response = await fetch(url, { method: 'POST' })
      if (response.status < 300 && response.status >= 200) {
        const res = await response.json()
      } else {
        console.error(
          `Error calling queue ${queueId} -> ${response.status}: ${response.statusText}`
        )
      }
    },
    web: {
      displayEmbedBubble: {
        parseUrl: ({}) => '',
        maxBubbleWidth: 780,
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
            .find((v) => v.name === 'is_contactid')?.value
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
  fetchers: [fetchQueues],
})
