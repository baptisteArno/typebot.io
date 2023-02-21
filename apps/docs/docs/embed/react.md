---
sidebar_position: 5
---

# React

## Install

Make sure you install both `@typebot.io/js` and `@typebot.io/react` first.

```bash
npm install @typebot.io/js @typebot.io/react
```

## Standard

```tsx
import { Standard } from '@typebot.io/react'

const App = () => {
  return (
    <Standard
      typebot="lead-generation-copy-3luzm6b"
      style={{ width: '100%', height: '600px' }}
    />
  )
}
```

This code is creating a container with a 100% width (will match parent width) and 600px height.

## Popup

```tsx
import { Popup } from '@typebot.io/react'

const App = () => {
  return <Popup typebot="lead-generation-copy-3luzm6b" autoShowDelay={3000} />
}
```

This code will automatically trigger the popup window after 3 seconds.

### Open or Close a popup

You can use these commands:

```js
import { open } from '@typebot.io/react'

open()
```

```js
import { close } from '@typebot.io/react'

close()
```

```js
import { toggle } from '@typebot.io/react'

toggle()
```

## Bubble

```tsx
import { Bubble } from '@typebot.io/react'

const App = () => {
  return (
    <Bubble
      typebot="lead-generation-copy-3luzm6b"
      previewMessage={{
        message: 'I have a question for you!',
        autoShowDelay: 5000,
        avatarUrl: 'https://avatars.githubusercontent.com/u/16015833?v=4',
      }}
      theme={{
        button: { backgroundColor: '#0042DA', iconColor: '#FFFFFF' },
        previewMessage: { backgroundColor: '#ffffff', textColor: 'black' },
      }}
    />
  )
}
```

This code will show the bubble and let a preview message appear after 5 seconds.

### Open or close the preview message

You can use these commands:

```js
import { showPreviewMessage } from '@typebot.io/react'

Typebot.showPreviewMessage()
```

```js
import { hidePreviewMessage } from '@typebot.io/react'

Typebot.hidePreviewMessage()
```

### Open or close the chat window

You can use these commands:

```js
import { open } from '@typebot.io/react'

open()
```

```js
import { close } from '@typebot.io/react'

close()
```

```js
import { toggle } from '@typebot.io/react'

toggle()
```

## Additional configuration

You can prefill the bot variable values in your embed code by adding the `prefilledVariables` option. Here is an example:

```tsx
import { Standard } from '@typebot.io/react'

const App = () => {
  return (
    <Standard
      typebot="lead-generation-copy-3luzm6b"
      style={{ width: '100%', height: '600px' }}
      prefilledVariables={{
        'Current URL': 'https://my-site/account',
        'User name': 'John Doe',
      }}
    />
  )
}
```

It will prefill the `Current URL` variable with "https://my-site/account" and the `User name` variable with "John Doe". More info about variables: [here](/editor/variables).

Note that if your site URL contains query params (i.e. https://typebot.io?User%20name=John%20Doe), the variables will automatically be injected to the typebot. So you don't need to manually transfer query params to the bot embed configuration.
