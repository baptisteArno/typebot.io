# Set variable

The "Set variable" block allows you to set a particular value to a variable.

<img src="/img/blocks/set-variable.png" width="600" alt="Set variable"/>

This value can be any kind of plain text but also **Javascript code**.

## Expressions with existing variables

It means you can apply operations on existing variables:

```
{{Score}} + 5
```

```
{{Score}} * {{Multiplier}}
```

## Current Date

But also set the variable to the current date for example:

```js
new Date()
```

## Random ID

Or a random ID:

```js
Math.round(Math.random() * 1000000)
```

## Current URL

A popular request also is to set a variable to the current URL. Here is the value that should be inserted:

```js
window.location.href
```

:::caution
It will not give you the parent URL if you embed the bot on your site.

A more bullet proof option is to pass the URL as a hidden variable in the embed code options. You can find an example [here](../../embed/html-javascript#additional-configuration).
:::
