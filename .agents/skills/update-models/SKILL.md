---
name: update-models
description: Use this skill when you need to update the AI models on the project.
---

# Update AI Models

## Objectif

Mettre à jour les listes de modèles disponibles pour les blocs OpenAI et Anthropic.

## Source de vérité

Utiliser **https://models.dev** comme référence pour les modèles disponibles. C'est une base de données open-source avec les IDs exacts utilisables dans les API.

## Fichiers à modifier

- `packages/forge/blocks/openai/src/constants.ts` → `chatModels`, `reasoningModels`, `modelsWithImageUrlSupport`
- `packages/forge/blocks/anthropic/src/constants.ts` → `anthropicModels`, `modelsWithImageUrlSupport`

## Procédure

1. Fetch le contenu de **https://models.dev** pour obtenir la liste des modèles actuels par provider (OpenAI, Anthropic).
2. Comparer avec les listes existantes dans les fichiers ci-dessus.
3. Ajouter les nouveaux modèles **en haut** des listes (les plus récents d'abord).
4. **Garder les anciens modèles** en bas de liste pour la rétrocompatibilité.
5. Mettre à jour `modelsWithImageUrlSupport` si les patterns de nommage changent.
