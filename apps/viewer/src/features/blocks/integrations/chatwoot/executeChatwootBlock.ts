import { ExecuteIntegrationResponse } from '@/features/chat/types'
import { extractVariablesFromText } from '@/features/variables/extractVariablesFromText'
import { parseGuessedValueType } from '@/features/variables/parseGuessedValueType'
import { parseVariables } from '@/features/variables/parseVariables'
import {
  ChatwootBlock,
  ChatwootOptions,
  SessionState,
} from '@typebot.io/schemas'

const parseSetUserCode = (user: ChatwootOptions['user']) => `
window.$chatwoot.setUser("${user?.id ?? ''}", {
  email: ${user?.email ? `"${user.email}"` : 'undefined'},
  name: ${user?.name ? `"${user.name}"` : 'undefined'},
  avatar_url: ${user?.avatarUrl ? `"${user.avatarUrl}"` : 'undefined'},
  phone_number: ${user?.phoneNumber ? `"${user.phoneNumber}"` : 'undefined'},
});

`
const parseChatwootOpenCode = ({
  baseUrl,
  websiteToken,
  user,
}: ChatwootOptions) => `
if (window.$chatwoot) {
  if(${Boolean(user)}) {
    ${parseSetUserCode(user)}
  }
  window.$chatwoot.toggle("open");
} else {
  (function (d, t) {
    var BASE_URL = "${baseUrl}";
    var g = d.createElement(t),
      s = d.getElementsByTagName(t)[0];
    g.src = BASE_URL + "/packs/js/sdk.js";
    g.defer = true;
    g.async = true;
    s.parentNode.insertBefore(g, s);
    g.onload = function () {
      window.chatwootSDK.run({
        websiteToken: "${websiteToken}",
        baseUrl: BASE_URL,
      });
      window.addEventListener("chatwoot:ready", function () {
        if(${Boolean(user?.id || user?.email)}) {
          ${parseSetUserCode(user)}
        }
        window.$chatwoot.toggle("open");
      });
    };
  })(document, "script");
}`

const chatwootCloseCode = `
if (window.$chatwoot) {
  window.$chatwoot.toggle("close");
  window.$chatwoot.toggleBubbleVisibility("hide");
}
`

export const executeChatwootBlock = (
  { typebot: { variables }, result }: SessionState,
  block: ChatwootBlock,
  lastBubbleBlockId?: string
): ExecuteIntegrationResponse => {
  const isPreview = !result.id
  const chatwootCode =
    block.options.task === 'Close widget'
      ? chatwootCloseCode
      : isPreview
      ? ''
      : parseChatwootOpenCode(block.options)
  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        lastBubbleBlockId,
        chatwoot: {
          scriptToExecute: {
            content: parseVariables(variables, { fieldToParse: 'id' })(
              chatwootCode
            ),
            args: extractVariablesFromText(variables)(chatwootCode).map(
              (variable) => ({
                id: variable.id,
                value: parseGuessedValueType(variable.value),
              })
            ),
          },
        },
      },
    ],
    logs:
      chatwootCode === ''
        ? [
            {
              status: 'info',
              description: 'Chatwoot block is not supported in preview',
              details: null,
            },
          ]
        : undefined,
  }
}
