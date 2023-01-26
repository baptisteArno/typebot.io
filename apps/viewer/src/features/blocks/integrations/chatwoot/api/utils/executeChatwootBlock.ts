import { ExecuteIntegrationResponse } from '@/features/chat'
import {
  parseVariables,
  parseCorrectValueType,
  extractVariablesFromText,
} from '@/features/variables'
import { ChatwootBlock, ChatwootOptions, SessionState } from 'models'

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

export const executeChatwootBlock = (
  { typebot: { variables }, isPreview }: SessionState,
  block: ChatwootBlock
): ExecuteIntegrationResponse => {
  const chatwootCode = parseChatwootOpenCode(block.options)
  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        chatwoot: {
          codeToExecute: {
            content: parseVariables(variables, { fieldToParse: 'id' })(
              chatwootCode
            ),
            args: extractVariablesFromText(variables)(chatwootCode).map(
              (variable) => ({
                id: variable.id,
                value: parseCorrectValueType(variable.value),
              })
            ),
          },
        },
      },
    ],
    logs: isPreview
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
