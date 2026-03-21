import { createBlock } from '@typebot.io/forge'
import { auth } from './auth'
import { GooglePlacesAutocompleteLogo } from './logo'
import { searchAddress } from './actions/searchAddress'

export const googlePlacesAutocompleteBlock = createBlock({
  id: 'google-places-autocomplete',
  name: 'Google Places Autocomplete',
  tags: ['address', 'location', 'maps', 'google'],
  LightLogo: GooglePlacesAutocompleteLogo,
  auth,
  actions: [searchAddress],
  docsUrl: 'https://docs.typebot.io/editor/blocks/integrations/google-places',
})
