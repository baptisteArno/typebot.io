-- Set background to white for all themes that have no background color set
UPDATE
  "Sniper" t
SET
  "theme" = jsonb_set(
    jsonb_set(
      t."theme",
      '{general,background,type}',
      '"Color"'
    ),
    '{general,background,content}',
    '"#FFFFFF"'
  ),
  "updatedAt" = now()
WHERE
  t."theme" -> 'general' -> 'background' ->> 'type' = 'None'