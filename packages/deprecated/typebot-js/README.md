> ⚠️ This library is deprecated in favor of [`@sniper.io/js`](https://www.npmjs.com/package/@sniper.io/js) and [`@sniper.io/react`](https://www.npmjs.com/package/@sniper.io/react)

# Sniper JS library

Frontend library to embed snipers from [Sniper](https://www.sniper.io/).

## Installation

To install, simply run:

```bash
npm install sniper-js
```

## Usage

It exposes 3 functions:

```ts
initContainer()
initPopup()
initBubble()
```

You can configure them directly in the "Share" tab of your sniper.

Example:

```ts
import { initContainer } from 'sniper-js'

const plausible = initContainer('container-id', {
  publishId: 'my-app.com',
})
```
