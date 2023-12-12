import { createAction, option } from '@typebot.io/forge'
import { baseOptions } from '../baseOptions'
import { defaultBaseUrl } from '../constants'

export const bookEvent = createAction({
  name: 'Book event',
  baseOptions,
  options: option.object({
    link: option.string.layout({
      label: 'Event link',
      placeholder: 'https://cal.com/...',
    }),
<<<<<<< HEAD
=======
    layout: option
      .enum(['Month', 'Weekly', 'Columns'])
      .layout({ label: 'Layout:', defaultValue: 'Month', direction: 'row' }),
>>>>>>> feat/the-forge
    name: option.string.layout({
      accordion: 'Prefill information',
      label: 'Name',
      placeholder: 'John Doe',
    }),
    email: option.string.layout({
      accordion: 'Prefill information',
      label: 'Email',
      placeholder: 'johndoe@gmail.com',
    }),
    saveBookedDateInVariableId: option.string.layout({
      label: 'Save booked date',
      input: 'variableDropdown',
    }),
  }),
  getSetVariableIds: ({ saveBookedDateInVariableId }) =>
    saveBookedDateInVariableId ? [saveBookedDateInVariableId] : [],
  run: {
    web: {
      displayEmbedBubble: {
        waitForEvent: {
          getSaveVariableId: ({ saveBookedDateInVariableId }) =>
            saveBookedDateInVariableId,
          parseFunction: () => {
            return {
              args: {},
              content: `Cal("on", {
                action: "bookingSuccessful",
                callback: (e) => {
                  continueFlow(e.detail.data.date)
                }
              })`,
            }
          },
        },
        parseInitFunction: ({ options }) => {
<<<<<<< HEAD
=======
          if (!options.link) throw new Error('Missing link')
>>>>>>> feat/the-forge
          const baseUrl = options.baseUrl ?? defaultBaseUrl
          const link = options.link?.startsWith('http')
            ? options.link.replace(/http.+:\/\/[^\/]+\//, '')
            : options.link
          return {
            args: {
              baseUrl,
              link: link ?? '',
<<<<<<< HEAD
              name: options.name ?? '',
              email: options.email ?? '',
=======
              name: options.name ?? null,
              email: options.email ?? null,
              layout: parseLayoutAttr(options.layout),
>>>>>>> feat/the-forge
            },
            content: `(function (C, A, L) {
                let p = function (a, ar) {
                  a.q.push(ar);
                };
                let d = C.document;
                C.Cal =
                  C.Cal ||
                  function () {
                    let cal = C.Cal;
                    let ar = arguments;
                    if (!cal.loaded) {
                      cal.ns = {};
                      cal.q = cal.q || [];
                      d.head.appendChild(d.createElement("script")).src = A;
                      cal.loaded = true;
                    }
                    if (ar[0] === L) {
                      const api = function () {
                        p(api, arguments);
                      };
                      const namespace = ar[1];
                      api.q = api.q || [];
                      typeof namespace === "string"
                        ? (cal.ns[namespace] = api) && p(api, ar)
                        : p(cal, ar);
                      return;
                    }
                    p(cal, ar);
                  };
              })(window, baseUrl + "/embed/embed.js", "init");
<<<<<<< HEAD
              console.log(Cal, window)
              Cal("init", { origin: baseUrl });
        
              Cal("inline", {
                elementOrSelector: typebotElement,
                calLink: link,
                layout: "month_view",
                config: {
                  name,
                  email
                }
              });`,
=======
              Cal("init", { origin: baseUrl });

              Cal("inline", {
                elementOrSelector: typebotElement,
                calLink: link,
                layout,
                config: {
                  name: name ?? undefined,
                  email: email ?? undefined,
                }
              });

              Cal("ui", {"hideEventTypeDetails":false,layout});`,
>>>>>>> feat/the-forge
          }
        },
      },
    },
  },
})
<<<<<<< HEAD
=======

const parseLayoutAttr = (
  layout?: 'Month' | 'Weekly' | 'Columns'
): 'month_view' | 'week_view' | 'column_view' => {
  switch (layout) {
    case 'Weekly':
      return 'week_view'
    case 'Columns':
      return 'column_view'
    default:
      return 'month_view'
  }
}
>>>>>>> feat/the-forge
