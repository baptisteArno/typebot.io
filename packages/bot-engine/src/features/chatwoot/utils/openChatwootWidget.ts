import { ChatwootBlock, ChatwootOptions } from 'models/features/chatwoot'
import { sendEventToParent } from 'services/chat'
import { IntegrationContext } from 'services/integration'
import { isEmbedded } from 'services/utils'
import { parseCorrectValueType, parseVariables } from 'services/variable'

const parseSetUserCode = (user: ChatwootOptions['user']) => `
window.$chatwoot.setUser("${user?.id ?? user?.email}", {
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
  if(${Boolean(user?.id || user?.email)}) {
    ${parseSetUserCode(user)}
  }
  if (typeof Typebot !== 'undefined') Typebot.getBubbleActions?.().close()
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
        if (typeof Typebot !== 'undefined') Typebot.getBubbleActions?.().close()
        window.$chatwoot.toggle("open");
      });
    };
  })(document, "script");
}`

export const openChatwootWidget = async (
  block: ChatwootBlock,
  { variables, isPreview, onNewLog }: IntegrationContext
) => {
  if (isPreview) {
    onNewLog({
      status: 'info',
      description: "Chatwoot won't open in preview mode",
      details: null,
    })
  } else if (isEmbedded) {
    sendEventToParent({
      codeToExecute: parseVariables(variables)(
        parseChatwootOpenCode(block.options)
      ),
    })
  } else {
    const func = Function(
      ...variables.map((v) => v.id),
      parseVariables(variables, { fieldToParse: 'id' })(
        parseChatwootOpenCode(block.options)
      )
    )
    try {
      await func(...variables.map((v) => parseCorrectValueType(v.value)))
    } catch (err) {
      console.error(err)
    }
  }

  return block.outgoingEdgeId
}
