import { createAction } from '@typebot.io/forge'
import { auth } from '../auth'

export const openMessenger = createAction({
  auth,
  name: 'Open Messenger',
  run: {
    web: {
      parseFunction: ({ options }) => {
        return {
          args: {
            options: null
          },
          content: parseOpenMessenger()
        }
      }
    },
  },
})

const parseOpenMessenger = () => {

  return `(function (d, t) {
    var BASE_URL = "https://static.zdassets.com/ekr/snippet.js?key=e8f8c615-8ccb-46ca-9641-adf5dd7b0b48";
    var ze_script = d.createElement(t);
    var s = d.getElementsByTagName(t)[0];

    console.log("configuring script");
    ze_script.id="ze-snippet";
    ze_script.src = BASE_URL;
    ze_script.crossorigin = "anonymous";
    ze_script.defer = true;
    ze_script.async = true;
    s.parentNode.insertBefore(ze_script, s);

    console.log("opening messenger");
    ze_script.onload = function () {
      console.log("loaded script");
       zE('messenger', 'open');
    };
  })(document, "script");
  `
}

