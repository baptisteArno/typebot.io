# Biome off rules migration plan

Objectif: supprimer progressivement les rules en `off` dans `biome.json` avec un ordre qui maximise les quick wins et limite le bruit de review.

## Criteres de priorisation

- nombre de diagnostics actuels dans le repo
- disponibilite d'un auto-fix Biome (`safe` ou `unsafe`)
- risque de changer le comportement applicatif
- bruit potentiel dans les diffs

## Lecture rapide

- `0 diag`: activable immediatement
- `safe`: auto-fix fiable
- `unsafe`: auto-fix possible mais a relire
- `manual`: correction manuelle

## Classement global

### 1. A activer immediatement

- `suspicious/noMisleadingCharacterClass` - evite les regex Unicode piegeuses - `0 diag`, `safe`
- `style/useSingleVarDeclarator` - une variable par declaration - `0 diag`, `unsafe`
- `a11y/useFocusableInteractive` - un element interactif doit etre focusable - `0 diag`, `manual`
- `correctness/noUnsafeOptionalChaining` - interdit `?.` dans des contextes ou `undefined` casserait ensuite - `0 diag`, `manual`
- `style/noDescendingSpecificity` - evite les selecteurs CSS dans un ordre de specificite fragile - `0 diag`, `manual`
- `suspicious/noAsyncPromiseExecutor` - interdit `new Promise(async ...)` - `0 diag`, `manual`
- `suspicious/noThenProperty` - evite les objets avec une propriete `then` trompeuse - `0 diag`, `manual`
- `suspicious/noUnknownAtRules` - interdit les `@rules` CSS inconnues - `0 diag`, `manual`

### 2. Quick wins auto-fix `safe`

- `style/useExponentiationOperator` - remplace `Math.pow` par `**` - `1 diag`, `safe`
- `style/useShorthandFunctionType` - prefere les types de fonction courts - `1 diag`, `safe`
- `correctness/noSwitchDeclarations` - force les accolades autour des `let`/`const` dans `switch` - `3 diags`, `safe`
- `complexity/noBannedTypes` - evite des types TS trompeurs comme `String`, `Function`, `{}` - `11 diags`, `safe`
- `style/noUselessElse` - retire les `else` apres un `return`/`throw` - `20 diags`, `safe`
- `style/noUnusedTemplateLiteral` - evite les backticks inutiles - `70 diags`, `safe`
- `style/useSelfClosingElements` - prefere `<Foo />` a `<Foo></Foo>` sans enfant - `97 diags`, `safe`

### 3. Quick wins auto-fix `unsafe` mais assez mecaniques

- `suspicious/useIsArray` - prefere `Array.isArray()` a `instanceof Array` - `1 diag`, `unsafe`
- `suspicious/noConfusingVoidType` - evite `void` hors retours/generiques - `2 diags`, `unsafe`
- `complexity/noUselessTernary` - simplifie les ternaires inutiles - `7 diags`, `unsafe`
- `complexity/useOptionalChain` - remplace les chaines de `&&` par `?.` - `13 diags`, `unsafe`
- `complexity/useLiteralKeys` - prefere `obj.foo` a `obj["foo"]` quand la cle est statique - `14 diags`, `unsafe`
- `suspicious/noGlobalIsNan` - prefere `Number.isNaN` a `isNaN` - `16 diags`, `unsafe`
- `style/useNodejsImportProtocol` - impose `node:` pour les builtins Node - `39 diags`, `unsafe`
- `style/useTemplate` - prefere les template literals aux concatenations - `57 diags`, `unsafe`

### 4. Peu de volume, mais manuel

- `correctness/useJsxKeyInIterable` - ajoute des `key` dans le JSX itere - `1 diag`, `manual`
- `suspicious/noExportsInTest` - evite les `export` dans les fichiers de test - `1 diag`, `manual`
- `suspicious/noDocumentCookie` - evite `document.cookie = ...` - `2 diags`, `manual`
- `correctness/noEmptyPattern` - interdit les destructurings vides - `3 diags`, `manual`
- `correctness/useHookAtTopLevel` - hooks React uniquement au top level - `3 diags`, `manual`
- `style/noParameterAssign` - interdit de reassigner les parametres - `8 diags`, `manual`
- `suspicious/useIterableCallbackReturn` - impose des retours coherents dans les callbacks de `map`/`filter`/etc. - `19 diags`, `manual`

### 5. Cout moyen / bruit potentiel

- `a11y/noStaticElementInteractions` - un `div`/`span` cliquable doit avoir role + clavier - `32 diags`, `manual`
- `correctness/useUniqueElementIds` - evite les `id="..."` statiques qui se dupliquent dans les composants reutilises - `33 diags`, `manual`
- `performance/noImgElement` - pousse vers `next/image` au lieu de `<img>` - `50 diags`, `manual`
- `complexity/noForEach` - prefere `for...of` a `forEach` - `84 diags`, `manual`

### 6. Gros chantiers a garder pour la fin

- `correctness/useExhaustiveDependencies` - verifie les dependances des hooks React - `63 diags`, `unsafe`
- `style/noNonNullAssertion` - interdit les `!` TypeScript - `76 diags`, `unsafe`
- `suspicious/noExplicitAny` - interdit `any` - `170 diags`, `manual`

## Plan recommande en 3 PRs

### PR 1

Activer les regles a `0 diag` et les mini quick wins:

- `suspicious/noMisleadingCharacterClass`
- `style/useSingleVarDeclarator`
- `a11y/useFocusableInteractive`
- `correctness/noUnsafeOptionalChaining`
- `style/noDescendingSpecificity`
- `suspicious/noAsyncPromiseExecutor`
- `suspicious/noThenProperty`
- `suspicious/noUnknownAtRules`
- `style/useExponentiationOperator`
- `style/useShorthandFunctionType`
- `suspicious/useIsArray`
- `correctness/noSwitchDeclarations`
- `correctness/noEmptyPattern`
- `correctness/useJsxKeyInIterable`
- `suspicious/noExportsInTest`
- `suspicious/noConfusingVoidType`

Pourquoi: tres peu de bruit, risque faible, bonne premiere victoire.

### PR 2

Activer les regles mecaniques avec auto-fix ou refactor simple:

- `style/noUselessElse`
- `style/noUnusedTemplateLiteral`
- `style/useSelfClosingElements`
- `style/useTemplate`
- `style/useNodejsImportProtocol`
- `complexity/noUselessTernary`
- `complexity/useOptionalChain`
- `complexity/useLiteralKeys`
- `complexity/noBannedTypes`
- `suspicious/noGlobalIsNan`

Pourquoi: diff plus gros, mais encore assez reviewable et souvent automatisable.

### PR 3

Garder les regles semantiques ou potentiellement bruyantes pour la fin:

- `a11y/noStaticElementInteractions`
- `performance/noImgElement`
- `style/noParameterAssign`
- `style/noNonNullAssertion`
- `correctness/useExhaustiveDependencies`
- `correctness/useUniqueElementIds`
- `correctness/useHookAtTopLevel`
- `complexity/noForEach`
- `suspicious/noExplicitAny`
- `suspicious/useIterableCallbackReturn`
- `suspicious/noDocumentCookie`

Pourquoi: forte valeur long terme, mais ce sont celles qui risquent le plus de demander des choix d'architecture ou des corrections manuelles.

## Ordre d'execution propose

1. Faire la PR 1 tout de suite.
2. Faire la PR 2 avec `bunx biome lint . --write --unsafe --only=...` par petits lots.
3. Faire la PR 3 par workspace, en finissant par `suspicious/noExplicitAny`.
