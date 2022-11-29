---
sidebar_position: 1
---

# Authentication

Every API resources are protected, and therefore require that you authenticate using an API token.

## Generate a token

1. Navigate to your typebot dashboard (https://app.typebot.io/typebots)
2. Click on Settings & Members > My account
3. Under the "API tokens" section, click on "Create"
4. Give it a name, then click on "Create token"
5. Copy your token.

<img
  src="/img/api/authentication/generateToken.png"
  width="900"
  alt="Generate token"
/>

## Use your token

You can authenticate by adding an `Authorization` header to all your HTTP calls. The Authorization header is formatted as such: `Authorization: Bearer <token>` (replace `<token>` with your token previously generated).

Example:

```sh
curl -L -X GET 'https://app.typebot.io/api/typebots/:typebotId/results' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer myAwesomeToken'
```
