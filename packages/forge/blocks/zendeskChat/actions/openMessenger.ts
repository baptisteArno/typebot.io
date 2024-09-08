import { createAction, option } from '@typebot.io/forge'
import { auth } from '../auth'

export const openMessenger = createAction({
  auth,
  name: 'Open Messenger',
  options: option.object({
    key: option.string.layout({
      label: "Web Widget Key",
      isRequired: true,
    }),
    enableAuth: option.boolean.layout({
      accordion: "Authentication",
      label: "Enable User Authentication",
      defaultValue: false,
    }),
    token: option.string.layout({
      accordion: "Authentication",
      label: "User Auth Token",
      isRequired: false,
    }),
  }),
  run: {
    web: {
      parseFunction: ({ options }) => {
        return {
          args: {
            enableAuth: options.enableAuth ? options.enableAuth?.toString() : "false",
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
      if ( enableAuth === "true" ) {
        zE("messenger", "loginUser", function (callback) {
          callback(token);
        });
      } 
      zE('messenger', 'open');
    };
  })(document, "script");
  `
}

