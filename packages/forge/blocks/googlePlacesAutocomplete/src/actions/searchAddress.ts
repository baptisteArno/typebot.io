import { createAction, option } from '@typebot.io/forge'
import { auth } from '../auth'

export const searchAddress = createAction({
  name: 'Search address',
  auth,
  options: option.object({
    placeholder: option.string.meta({
      layout: {
        label: 'Placeholder text',
        placeholder: 'Start typing an address...',
      },
    }),
    language: option.string.meta({
      layout: {
        label: 'Language',
        placeholder: 'en',
        helperText:
          'BCP-47 language code (e.g. `en`, `fr`, `de`). Defaults to browser language.',
      },
    }),
    country: option.string.meta({
      layout: {
        label: 'Restrict to country',
        placeholder: 'us',
        helperText:
          'ISO 3166-1 alpha-2 country code to restrict results (e.g. `us`, `fr`). Leave empty for worldwide.',
      },
    }),
    saveResultInVariableId: option.string.meta({
      layout: {
        label: 'Save result',
        inputType: 'variableDropdown',
        helperText:
          'Saves the full place object. Access individual fields with `{{Result}}.state_code`, `{{Result}}.country_code`, `{{Result}}.formatted_address`, `{{Result}}.city`, `{{Result}}.postal_code`, `{{Result}}.latitude`, `{{Result}}.longitude`, `{{Result}}.place_id`, etc.',
      },
    }),
  }),
  getSetVariableIds: (options) =>
    options.saveResultInVariableId ? [options.saveResultInVariableId] : [],
  getEmbedSaveVariableId: (options) => options.saveResultInVariableId,
})
