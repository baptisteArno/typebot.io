import { createAction, option } from '@typebot.io/forge'
import { auth } from '../auth'

export const openWebWidget = createAction({
  auth,
  name: 'Open Web Widget',
  options: option.object({
    key: option.string.layout({
      label: "Web widget key",
      isRequired: true,
    }),
    isAuthEnabled: option.boolean.layout({
      accordion: "Authentication",
      label: "Enable user authentication",
      defaultValue: false,
    }),
    token: option.string.layout({
      accordion: "Authentication",
      label: "User auth token",
      isRequired: false
    })
  }),
  run: {
    web: {
      parseFunction: ({ options }) => {
        return {
          args: {
            isAuthEnabled: options.isAuthEnabled ? options.isAuthEnabled?.toString() : "false",
            token: options.token ?? null,
            key: options.key ?? null
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
      if ( isAuthEnabled === "true" ) {
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

