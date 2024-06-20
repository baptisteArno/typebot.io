import { ExecuteIntegrationResponse } from '../../../types'
import { env } from '@sniper.io/env'
import { isDefined } from '@sniper.io/lib'
import { ChatwootBlock, SessionState } from '@sniper.io/schemas'
import { extractVariablesFromText } from '@sniper.io/variables/extractVariablesFromText'
import { parseGuessedValueType } from '@sniper.io/variables/parseGuessedValueType'
import { parseVariables } from '@sniper.io/variables/parseVariables'
import { defaultChatwootOptions } from '@sniper.io/schemas/features/blocks/integrations/chatwoot/constants'

const parseSetUserCode = (
  user: NonNullable<ChatwootBlock['options']>['user'],
  resultId: string
) =>
  user?.email || user?.id
    ? `
window.$chatwoot.setUser(${user?.id ?? user.email ?? `"${resultId}"`}, {
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
  sniperId,
}: ChatwootBlock['options'] & { sniperId: string; resultId: string }) => {
  const openChatwoot = `${parseSetUserCode(user, resultId)}
  if(window.Sniper?.unmount) window.Sniper.unmount();
  window.$chatwoot.setCustomAttributes({
    sniper_result_url: "${
      env.NEXTAUTH_URL
    }/snipers/${sniperId}/results?id=${resultId}",
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
    var BASE_URL = "${baseUrl ?? defaultChatwootOptions.baseUrl}";
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
  state: SessionState,
  block: ChatwootBlock
): ExecuteIntegrationResponse => {
  if (state.whatsApp) return { outgoingEdgeId: block.outgoingEdgeId }
  const { sniper, resultId } = state.snipersQueue[0]
  const chatwootCode =
    block.options?.task === 'Close widget'
      ? chatwootCloseCode
      : isDefined(resultId)
      ? parseChatwootOpenCode({
          ...block.options,
          sniperId: sniper.id,
          resultId,
        })
      : ''

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        type: 'chatwoot',
        chatwoot: {
          scriptToExecute: {
            content: parseVariables(sniper.variables, { fieldToParse: 'id' })(
              chatwootCode
            ),
            args: extractVariablesFromText(sniper.variables)(chatwootCode).map(
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
