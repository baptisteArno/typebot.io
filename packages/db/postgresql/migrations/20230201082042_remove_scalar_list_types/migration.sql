ALTER TABLE
  "PublicTypebot"
ALTER COLUMN
  variables TYPE JSONB USING array_to_json(variables);

ALTER TABLE
  "Result"
ALTER COLUMN
  variables TYPE JSONB USING array_to_json(variables);

ALTER TABLE
  "Typebot"
ALTER COLUMN
  variables TYPE JSONB USING array_to_json(variables);

ALTER TABLE
  "User"
ALTER COLUMN
  "onboardingCategories" TYPE JSONB USING array_to_json("onboardingCategories");

ALTER TABLE
  "Webhook"
ALTER COLUMN
  "queryParams" TYPE JSONB USING array_to_json("queryParams"),
ALTER COLUMN
  "headers" TYPE JSONB USING array_to_json("headers");