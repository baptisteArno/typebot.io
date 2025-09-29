-- Migration: remove_editing_fields_from_typebot

ALTER TABLE "Typebot"
  DROP COLUMN IF EXISTS "editingUserName",
  DROP COLUMN IF EXISTS "editingUserEmail",
  DROP COLUMN IF EXISTS "isBeingEdited",
  DROP COLUMN IF EXISTS "editingStartedAt";
