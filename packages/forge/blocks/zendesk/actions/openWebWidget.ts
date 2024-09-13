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
      isRequired: false,
    }),
    fields: option.array(option.object({
      key: option.string.layout({
        label: "Field",
        isRequired: true,
      }),
      value: option.string.layout({
        label: "Value",
        isRequired: true,
      }),
    })).layout({
      itemLabel: "field",
      accordion: "Conversation Fields",
    }),
    tags: option.array(option.object({
      name: option.string.layout({
        label: "Tag",
        isRequired: true,
      }),
    })).layout({
      itemLabel: "tag",
      accordion: "Conversation Tags",
    }),
  }),
  run: {
    web: {
      parseFunction: ({ options }) => {
        return {
          args: {
            enableAuth: options.isAuthEnabled ? options.isAuthEnabled?.toString() : "false",
            token: options.token ?? null,
            key: options.key ?? null,
            fields: JSON.stringify(options.fields),
            tags: JSON.stringify(options.tags)
          },
          content: parseOpenMessenger()
        }
      }
    },
  },
})

const parseOpenMessenger2 = () => {

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

     // zE("messenger:set", "cookies", false);
     // zE("messenger:set", "cookies", true);

      if ( enableAuth === "true" ) {
        zE("messenger", "loginUser", function (callback) {
          //console.log("Authenticating user");
          callback(token);
        });
      } 
      //zE("messenger", "open");

      
      var fieldArr = JSON.parse(fields);
      fieldArr.forEach(function(field) {
        zE("messenger:set", "conversationFields", [{ id: field.key, value: field.value }]);
      });

      const fieldArr = JSON.parse(fields);
      fieldArr.forEach(({ key, value }) => {
        zE("messenger:set", "conversationFields", [{ id: key, value }]);
      });
      
      var tagList = (JSON.parse(tags) || []).map(tag => tag.name);
      if(tagList.length > 0){
        zE("messenger:set", "conversationTags", tagList);
      }

       zE("messenger", "open");
      

    };
  })(document, "script");
  `
}

