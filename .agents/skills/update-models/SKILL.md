---
name: update-models
description: Use this skill when you need to update the AI models on the project.
---

# Update AI Models

## Objectif

Mettre à jour les modèles suggérés par les blocs IA dont la liste est statique.

## Source de vérité

La documentation officielle de chaque fournisseur : son catalogue de modèles et sa page de dépréciations. Ne pas se fier à la mémoire ni à un agrégateur.

- OpenAI : https://developers.openai.com/api/docs/models/all et https://developers.openai.com/api/docs/deprecations (chaque page modèle donne l'ID et les endpoints supportés)
- Anthropic : https://platform.claude.com/docs/en/about-claude/models/overview et https://platform.claude.com/docs/en/about-claude/model-deprecations
- Mistral : https://docs.mistral.ai/models (statut, alias `-latest` et dates de retrait)
- DeepSeek : https://api-docs.deepseek.com/quick_start/pricing et https://api-docs.deepseek.com/updates
- Perplexity : https://docs.perplexity.ai/docs/resources/changelog

Ajouter `.md` à l'URL donne souvent une version Markdown de la page.

## Fichiers à modifier

- `packages/forge/blocks/openai/src/constants.ts` : `models`, `chatCompletionModels`, `transcriptionModels`, `ttsModels`, `modelsWithImageUrlSupport`
- `packages/forge/blocks/anthropic/src/constants.ts` : `anthropicModels`, `modelsWithImageUrlSupport`
- `packages/forge/blocks/mistral/src/constants.ts` : `models`
- `packages/forge/blocks/deepseek/src/constants.ts` : `deepSeekModels`
- `packages/forge/blocks/perplexity/src/constants.ts` : `perplexityModels`

Groq et OpenRouter récupèrent leurs modèles via l'API, et Together AI attend un ID saisi librement. Ces blocs n'ont donc pas de liste à maintenir.

## Procédure

1. Relever les IDs exacts dans la documentation de chaque fournisseur.
2. Ajouter les nouveaux modèles **en haut** des listes (les plus récents d'abord).
3. Garder en bas de liste les anciens modèles encore servis, même dépréciés, et retirer ceux que le fournisseur a arrêtés. Le champ Model accepte un texte libre, donc retirer une suggestion ne casse pas un bot existant.
4. OpenAI : « Create chat completion » appelle Chat Completions, alors que « Ask Model » et « Generate variables » appellent Responses. Ajuster le filtre de `chatCompletionModels` pour exclure les modèles dont la page indique Chat Completions « Not supported » (les variantes Pro) ou que le guide de migration du dernier modèle réserve à Responses pour les appels d'outils (GPT-6).
5. Mettre à jour `modelsWithImageUrlSupport` si les patterns de nommage changent.
6. Vérifier que la version installée du provider AI SDK reconnaît les nouveaux modèles (son catalogue de modèles dans `opensrc`), surtout pour les paramètres de raisonnement et `temperature`.
7. Mettre à jour l'exemple de modèle dans `apps/docs/editor/blocks/integrations/openai.mdx` et le modèle du template `packages/templates/src/typebots/openai-assistant-chat.json`.
