import { ExecuteIntegrationResponse } from '@/features/chat/types'
import { extractVariablesFromText } from '@/features/variables/extractVariablesFromText'
import { parseGuessedValueType } from '@/features/variables/parseGuessedValueType'
import { parseVariables } from '@/features/variables/parseVariables'
import { isDefined } from '@typebot.io/lib'
import {
  ChatwootBlock,
  ChatwootOptions,
  SessionState,
} from '@typebot.io/schemas'

const parseSetUserCode = (user: ChatwootOptions['user'], resultId: string) =>
  user?.email || user?.id
    ? `
window.$chatwoot.setUser(${user?.id ?? `"${resultId}"`}, {
  email: ${user?.email ? user.email : 'undefined'},
  name: ${user?.name ? user.name : 'undefined'},
  avatar_url: ${user?.avatarUrl ? user.avatarUrl : 'undefined'},
  phone_number: ${user?.phoneNumber ? user.phoneNumber : 'undefined'},
});`
    : ''

const parseChatwootOpenCode = ({
  baseUrl,
  websiteToken,
  user,
  resultId,
  typebotId,
}: ChatwootOptions & { typebotId: string; resultId: string }) => {
  const openChatwoot = `${parseSetUserCode(user, resultId)}
  window.$chatwoot.setCustomAttributes({
    typebot_result_url: "${
      process.env.NEXTAUTH_URL
    }/typebots/${typebotId}/results?id=${resultId}",
  });
  window.$chatwoot.toggle("open");
  `

  return `
  window.addEventListener("chatwoot:error", function (error) {
    console.log(error);
  });

  if (window.$chatwoot) {${openChatwoot}}
  else {
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
      window.addEventListener("chatwoot:ready", function () {${openChatwoot}});
    };
  })(document, "script");
}`
}

const chatwootCloseCode = `
if (window.$chatwoot) {
  window.$chatwoot.toggle("close");
  window.$chatwoot.toggleBubbleVisibility("hide");
}
`

export const executeChatwootBlock = (
  { typebot, result }: SessionState,
  block: ChatwootBlock
): ExecuteIntegrationResponse => {
  const chatwootCode =
    block.options.task === 'Close widget'
      ? chatwootCloseCode
      : isDefined(result.id)
      ? parseChatwootOpenCode({
          ...block.options,
          typebotId: typebot.id,
          resultId: result.id,
        })
      : ''
  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        chatwoot: {
          scriptToExecute: {
            content: parseVariables(typebot.variables, { fieldToParse: 'id' })(
              chatwootCode
            ),
            args: extractVariablesFromText(typebot.variables)(chatwootCode).map(
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
