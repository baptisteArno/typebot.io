> ⚠️ This library is deprecated in favor of [`@flowdacity/js`](https://www.npmjs.com/package/@flowdacity/js) and [`@flowdacity/react`](https://www.npmjs.com/package/@flowdacity/react)

# Typebot JS library

Frontend library to embed typebots from [Typebot](https://www.flowdacity.com/).

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
