# Typebot JS library

[![NPM](https://flat.badgen.net/npm/v/typebot-js)](https://www.npmjs.com/package/typebot-js) [![Bundle](https://flat.badgen.net/bundlephobia/minzip/typebot-js)](https://bundlephobia.com/result?p=typebot-js@latest) [![Build Status](https://travis-ci.com/plausible/typebot-js.svg?branch=master)](https://travis-ci.com/plausible/typebot-js)

Frontend library to embed typebots from [Typebot](https://www.typebot.io/).

## Installation

To install, simply run:

```bash
npm install typebot-js

yarn add typebot-js
```

## Usage

It exposes 3 functions:

```ts
initContainer();
initPopup();
initBubble();
```

You can configure them directly in the "Share" tab of your typebot.

Example:

```ts
import { initContainer } from "typebot-js";

const plausible = initContainer("container-id", {
  publishId: "my-app.com",
});
```
