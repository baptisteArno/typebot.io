---
sidebar_position: 1
---

# Set variable

The "Set variable" block allows you to set a particular value to a variable.

<img src="/img/blocks/logic/set-variable.png" width="600" alt="Set variable"/>

This value can be any kind of plain text but also **Javascript code**.

## Expressions with existing variables

It means you can apply operations on existing variables.

Add a value to your variable:

```
{{Score}} + 5
```

Compute a sum of variables:

```
{{Score}} + {{Answer}}
```

Multiply variables together:

```
{{Score}} * {{Multiplier}}
```

Compute a percentage:

```
{{Score}} * 100 / {{Max Score}}
```

Extract the first name from a full name:

```
{{Full name}}.split(' ')[0]
```

## Code

The code value should be written Javascript. It will read the returned value of the code and set it to your variable.

```js
const name = 'John' + 'Smith'
return name
```

If you don't provide the `return` keyword then it will be automatically prepended to the beginning of your code.

```js
'John' + 'Smith'
```

is the same as

```js
return 'John' + 'Smith'
```

## Current Date

You can create a `Submitted at` (or any other name) variable using this code:

```js
new Date().toISOString()
```

It will set the variable to the current date and time.

## Random ID

Or a random ID:

```js
Math.round(Math.random() * 1000000)
```

:::note
Keep in mind that the code is executed on the server. So you don't have access to browser variables such as `window` or `document`.
:::

The code can also be multi-line. The Set variable block will get the value following the `return` statement.
