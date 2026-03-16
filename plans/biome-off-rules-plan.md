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

## Plan recommande

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

### PR 3A - cookies navigateur + ids uniques

Commencer la fin de migration par les corrections les plus bornees:

- `suspicious/noDocumentCookie`
- `correctness/useUniqueElementIds`

Workspaces cibles:

- `apps/landing-page`
- `apps/builder`

Pourquoi: faible blast radius, pattern de correction deja present dans le repo, tres bon candidat pour une petite PR rapide.

### PR 3B - semantique interactive / accessibilite

Traiter ensuite les elements statiques rendus interactifs:

- `a11y/noStaticElementInteractions`

Workspaces cibles:

- `apps/builder`
- `apps/landing-page`
- `packages/embeds/js`

Pourquoi: demande souvent un vrai choix de markup ou de composition de composant, surtout quand il y a des boutons imbriques.

### PR 3C - nettoyage boucles / callbacks / mutation de parametres

Regrouper les refactors surtout mecaniques et peu lies a React:

- `complexity/noForEach`
- `suspicious/useIterableCallbackReturn`
- `style/noParameterAssign`

Workspaces cibles:

- `packages/*`
- helpers/actions de `apps/builder`

Pourquoi: diff assez reviewable si isole, risque produit faible a moyen, et bon rendement sur du code de support.

### PR 3D - durcissement de typage

Traiter ensuite les raccourcis de typage les plus bruyants:

- `style/noNonNullAssertion`
- `suspicious/noExplicitAny`

Workspaces cibles:

- d'abord `packages/*`
- puis `apps/builder`

Pourquoi: risque plus eleve sur les contrats de types partages; mieux vaut ne pas melanger ca avec les changements UI ou hooks.

### PR 3E - correction des hooks React

Finir par les regles les plus semantiques cote React:

- `correctness/useExhaustiveDependencies`
- `correctness/useHookAtTopLevel`

Workspaces cibles:

- `apps/builder`

Pourquoi: c'est la partie la plus sensible fonctionnellement car elle peut changer le timing d'initialisation, d'auto-save et de synchronisation d'etat.

## Ordre d'execution propose

1. Faire la PR 1 tout de suite.
2. Faire la PR 2 avec `bunx biome lint . --write --unsafe --only=...` par petits lots.
3. Faire la PR 3A pour eliminer rapidement les cas les plus simples et locaux.
4. Faire la PR 3B separement pour laisser la review se concentrer sur la semantique HTML et l'accessibilite.
5. Faire la PR 3C apres avoir decide la politique `noImgElement` par workspace.
6. Faire la PR 3D sur les packages et helpers avec une approche mecanique.
7. Faire la PR 3E en commencant par les packages partages avant `apps/builder`.
8. Faire la PR 3F en dernier, avec verification manuelle des comportements React critiques.

## Resume de priorisation pour PR 3

- ne pas melanger UI semantique, politique framework (`next/image`), typage partage et hooks React dans la meme PR
- commencer par les changements locaux avec pattern clair
- garder les hooks React et `noExplicitAny` pour la fin
- preferer une lecture par famille de risque plutot qu'une seule grosse PR finale
