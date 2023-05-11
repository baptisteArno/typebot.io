---
sidebar_position: 1
---

# Set variable

The "Set variable" block allows you to set a particular value to a variable.

<img src="/img/blocks/logic/set-variable.png" width="600" alt="Set variable"/>

## Custom

You can set your variable with any value with `Custom`. It can be any kind of plain text but also **Javascript code**.

### Expressions with existing variables

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

Transform existing variable to upper case or lower case:

```
{{Name}}.toUpperCase()
```

```
{{Name}}.toLowerCase()
```

This can also be Javascript code. It will read the returned value of the code and set it to your variable.

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

:::note
Variables in script are not parsed, they are evaluated. So it should be treated as if it were real Javascript variables.

So, if you write `"{{My variable}}"`, it will parse the variable ID (something like `vclfqgqkdf000008mh3r6xakty`). You need to remove the double quotes to properly get the variable content value.

For example,

- ❌ `"{{URL base}}/path"` => `vclfqgqkdf000008mh3r6xakty/path`
- ✅ `{{URL base}} + '/path'` => `https://domain.com/path`
- ✅ `` `${{{URL base}}}/path` `` => `https://domain.com/path`

:::

## Map

This is a convenient value block that allows you to easily get an item from a list that has the same index as an item from another list.

When you are pulling data from another service, sometimes, you will have 2 lists: `Labels` and `Ids`. Labels are the data displayed to the user and Ids are the data used for other requests to that external service.

This value block allows you to find the `Id` from `Ids` with the same index as `Label` in `Labels`

<img src="/img/blocks/logic/set-variable-map-item.png" width="600" alt="Set variable map item with same index"/>
