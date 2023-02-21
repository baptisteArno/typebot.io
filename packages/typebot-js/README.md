> ⚠️ This library is deprecated in favor of [`@typebot.io/js`](https://www.npmjs.com/package/@typebot.io/js) and [`@typebot.io/react`](https://www.npmjs.com/package/@typebot.io/react)

# Typebot JS library

Frontend library to embed typebots from [Typebot](https://www.typebot.io/).

## Installation

To install, simply run:

```bash
npm install typebot-js
```

## Usage

It exposes 3 functions:

```ts
initContainer()
initPopup()
initBubble()
```

You can configure them directly in the "Share" tab of your typebot.

Example:

```ts
import { initContainer } from 'typebot-js'

const plausible = initContainer('container-id', {
  publishId: 'my-app.com',
})
```
