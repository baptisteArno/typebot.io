import { createActionHandler } from "@typebot.io/forge";
import { bookEvent } from "./actions/bookEvent";
import { defaultBaseUrl } from "./constants";

export default [
  createActionHandler(bookEvent, {
    web: {
      displayEmbedBubble: {
        parseUrl: ({ options }) => options.link,
        waitForEvent: {
          parseFunction: () => {
            return {
              args: {},
              content: `{
                const callback = (e) => {
                  continueFlow(e.detail.data.date)
                  Cal("off", {
                    action: "bookingSuccessful",
                    callback
                  })
                }

                Cal("on", {
                  action: "bookingSuccessful",
                  callback
                })
              }`,
            };
          },
        },
        parseInitFunction: ({ options }) => {
          if (!options.link) throw new Error("Missing link");
          const baseUrl = options.baseUrl ?? defaultBaseUrl;
          const link = options.link?.startsWith("http")
            ? options.link.replace(/http.+:\/\/[^/]+\//, "")
            : options.link;
          return {
            args: {
              baseUrl,
              link: link ?? "",
              name: options.name ?? null,
              email: options.email ?? null,
              layout: parseLayoutAttr(options.layout),
              phone: options.phone ?? null,
              additionalNotes: options.additionalNotes ?? null,
              otherPrefilledInformations:
                options.anyPrefilledInformations?.reduce<
                  Record<string, string>
                >((acc, curr) => {
                  if (!curr.questionId || !curr.value) return acc;
                  acc[curr.questionId] = curr.value;
                  return acc;
                }, {}) ?? null,
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

              Cal("init", { origin: baseUrl });

              const location = phone ? JSON.stringify({
                value: "phone",
                optionValue: phone
              }) : undefined

              Cal("inline", {
                elementOrSelector: typebotElement,
                calLink: link,
                layout,
                config: {
                  name: name ?? undefined,
                  email: email ?? undefined,
                  notes: additionalNotes ?? undefined,
                  location,
                  ...otherPrefilledInformations,
                }
              });

              Cal("ui", {"hideEventTypeDetails":false,layout});`,
          };
        },
      },
    },
  }),
];

const parseLayoutAttr = (
  layout?: "Month" | "Weekly" | "Columns",
): "month_view" | "week_view" | "column_view" => {
  switch (layout) {
    case "Weekly":
      return "week_view";
    case "Columns":
      return "column_view";
    default:
      return "month_view";
  }
};
