# Set variable

The "Set variable" block allows you to set a particular value to a variable.

<img src="/img/blocks/set-variable.png" width="600" alt="Set variable"/>

This value can be any kind of plain text but also **Javascript code**.

It means you can apply operations on existing variables:

```
{{Score}} + 5
```

```
{{Score}} * {{Multiplier}}
```

But also set the variable to the current date for example:

```
new Date()
```

Or a random ID:

```
Math.round(Math.random() * 1000000)
```
