# Forward UTM parameters to a typebot

The UTM parameter name should be listed in the Variables dropdown of your flow you can create it on any variable dropdown. Then, if your typebot is launched with the declared UTM parameter. It should appear in the Results tab.

Once you have saved the UTM values into variables like `utm_source` and `utm_value`. You can build a redirect URL in a [Redirect block](../editor/blocks/logic/redirect.md) with the same UTMs like this:

```
https://redirect-site.com?utm_source={{utm_source}}&utm_value={{utm_value}}
```

<div
  style={{
    position: "relative",
    paddingBottom: "64.5933014354067%",
    height: 0
  }}
>
  <iframe
    src="https://www.loom.com/embed/9b6cb65aff0a485e9e021b42310b207c?sid=2c61af7c-6aef-443e-b63e-941a079f2031"
    frameBorder={0}
    webkitallowfullscreen=""
    mozallowfullscreen=""
    allowFullScreen=""
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%"
    }}
  />
</div>
