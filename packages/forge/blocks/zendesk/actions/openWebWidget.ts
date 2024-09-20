import { createAction, option } from '@typebot.io/forge'
import { sign } from 'jsonwebtoken';
import { auth } from '../auth'

export const openWebWidget = createAction({
  auth,
  name: 'Open Web Widget',
  options: option.object({
    userId: option.string.layout({
      label: 'User ID',
      isRequired: false,
    }),
    name: option.string.layout({
      label: 'Name',
      isRequired: false,
    }),
    email: option.string.layout({
      label: 'Email',
      isRequired: false,
    }),
  }),
  run: {
    web: {
      parseFunction: ({
        credentials: { conversationsSecretKey, conversationsKeyId, webWidgetKey },
        options: { userId, name, email },
      }) => {
        let token = ''

        if (userId && email) {
          token = sign({ scope: 'user', external_id: userId ?? '', name: name ?? '', email: email, email_verified: "true" }, conversationsSecretKey ?? '', { algorithm: "HS256", keyid: conversationsKeyId ?? '' });
        } else if (userId) {
          token = sign({ scope: 'user', external_id: userId ?? '', name: name ?? '' }, conversationsSecretKey ?? '', { algorithm: "HS256", keyid: conversationsKeyId ?? '' });
        }

        return {
          args: {
            isAuthEnabled: (userId !== undefined && userId != '') ? "true" : "false",
            token: token,
            key: webWidgetKey ?? ''
          },
          content: parseOpenMessenger()
        }
      }
    },
  },
})

const parseOpenMessenger = () => {
  return `(function (d, t) {
    var ZD_URL = "https://static.zdassets.com/ekr/snippet.js?key=" + key;

    var ze_script = d.createElement(t);
    var s = d.getElementsByTagName(t)[0];

    ze_script.id="ze-snippet";
    ze_script.src = ZD_URL;
    ze_script.crossorigin = "anonymous";
    ze_script.defer = true;
    ze_script.async = true;
    s.parentNode.insertBefore(ze_script, s);

    ze_script.onload = function () {
      if ( isAuthEnabled === "true" && token != "") {
        zE("messenger", "loginUser", function (callback) {
          callback(token);
          zE("messenger", "open");
        });
      } else {
        zE("messenger", "open");
      }
    };
  })(document, "script");
  `
}

