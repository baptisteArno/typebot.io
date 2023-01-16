---
sidebar_position: 1
slug: /
---

# Introduction

Typebot currently offers 2 APIs: **Builder** and **Chat**

## Builder

The Builder API is about what you can edit on https://app.typebot.io (i.e. create typebots, insert blocks etc, get results...). It is currently under active development and new endpoints will be added incrementally.

## Chat

:::caution
You should not use it in production. This API is experimental at the moment and will be changed without notice.
:::

The Chat API allows you to execute (chat) with a typebot.

### How to find my `typebotId`

If you'd like to execute the typebot in preview mode, you will need to provide the ID of the building typebot available in the editor URL:

<img
  src="/img/api/typebotId.png"
  width="900"
  alt="Get typebot ID"
/>

For published typebot execution, you need to provide the public typebot ID available here:

<img
  src="/img/api/publicId.png"
  width="900"
  alt="Get typebot ID"
/>
