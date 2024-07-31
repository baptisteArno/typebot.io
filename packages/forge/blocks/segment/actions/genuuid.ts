import { createAction, option } from '@typebot.io/forge'
import { v4 as uuidv4 } from 'uuid';

export const genUUID = createAction({
  name: 'Generate UUID',
  options: option.object({
    saveUUIDInVariableId: option.string.layout({
      label: 'Save UUID',
      inputType: 'variableDropdown',
    }),
  }),
  getSetVariableIds: (options) =>
    options.saveUUIDInVariableId ? [options.saveUUIDInVariableId] : [],
  run: {
    server: async ({ options, variables, logs }) => {

      if (!options.saveUUIDInVariableId)
        return logs.add(
          'UUID variable not specified Please select a variable to save the generated UUID.'
        )

      const uuid = uuidv4();

      variables.set(options.saveUUIDInVariableId, uuid)
    }
  },
})
