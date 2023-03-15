import { parseVariables } from '@/features/variables'
import { IntegrationState } from '@/types'
import { sendEventToParent } from '@/utils/chat'
import { isEmbedded } from '@/utils/helpers'
import { ChatwootBlock, ChatwootOptions } from '@typebot.io/schemas'

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
  block: ChatwootBlock,
  { variables, isPreview, onNewLog }: IntegrationState
) => {
  if (isPreview) {
    onNewLog({
      status: 'info',
      description: "Chatwoot won't open in preview mode",
      details: null,
    })
  } else if (isEmbedded) {
    sendEventToParent({
      closeChatBubble: true,
    })
    sendEventToParent({
      codeToExecute: parseVariables(variables)(
        parseChatwootOpenCode(block.options)
      ),
    })
  } else {
    const func = Function(
      parseVariables(variables)(parseChatwootOpenCode(block.options))
    )
    try {
      func()
    } catch (err) {
      console.error(err)
    }
  }

  return block.outgoingEdgeId
}
