-- Typebot seeding SQL script based on manually created flow cmip1n8ty0001kuwtyn0o5la1
-- 1. Create user if not exists
INSERT INTO "User" (id, email, name, "emailVerified", "onboardingCategories")
SELECT 'claudia-user-id', 'claudia@acme.inc', 'Claudia System User', NOW(), '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE email = 'claudia@acme.inc');

-- 2. Create workspace if not exists  
INSERT INTO "Workspace" (id, name, plan)
SELECT 'claudia-workspace-id', 'claudia_project', 'FREE'
WHERE NOT EXISTS (SELECT 1 FROM "Workspace" WHERE name = 'claudia_project');

-- 3. Add user to workspace if not exists
INSERT INTO "MemberInWorkspace" ("userId", "workspaceId", role)
SELECT 'claudia-user-id', 'claudia-workspace-id', 'ADMIN'
WHERE NOT EXISTS (
  SELECT 1 FROM "MemberInWorkspace" 
  WHERE "userId" = 'claudia-user-id' AND "workspaceId" = 'claudia-workspace-id'
);

-- 3a. Create API token for claudia user matching docker-compose config
INSERT INTO "ApiToken" (id, token, name, "ownerId", "createdAt")
SELECT 'claudia-api-token-id', 'dummy-token', 'Claudia API Token', 'claudia-user-id', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "ApiToken" WHERE token = 'dummy-token'
);

-- 4. Create or update eddie-default typebot with exact structure from working UI-created typebot
INSERT INTO "Typebot" (id, name, "workspaceId", "publicId", version, groups, edges, variables, theme, settings, events)
VALUES (
  'claudia-typebot-id',
  'eddie-default', 
  'claudia-workspace-id',
  'eddie-default',
  '6',
  '[{"id": "p17dxk2589q9kakiz4n1yml8", "title": "Group #1", "blocks": [{"id": "ebjca0rpwyzgpaezrg1yqx1v", "type": "text", "content": {"richText": [{"type": "p", "children": [{"text": "Hello from typebot!"}]}]}, "outgoingEdgeId": "der9u2befjm13mgdd4gul4w9"}], "graphCoordinates": {"x": 568, "y": 255}}, {"id": "yx2tckxezerelmjndugrpw1d", "title": "Group #2", "blocks": [{"id": "g420n50vye1m0j3k5m757c9s", "type": "claudia", "options": {"action": "End Flow [N1]", "topic": ""}}], "graphCoordinates": {"x": 1178, "y": 580}}]'::jsonb,
  '[{"id": "der9u2befjm13mgdd4gul4w9", "to": {"groupId": "yx2tckxezerelmjndugrpw1d"}, "from": {"blockId": "ebjca0rpwyzgpaezrg1yqx1v"}}, {"id": "o0yzfoahvwbn8wqdzyuz5m7n", "to": {"groupId": "p17dxk2589q9kakiz4n1yml8"}, "from": {"eventId": "qmbhi0mk1lewbe0ez5nx45fb"}}]'::jsonb,
  '[]'::jsonb,
  '{}'::jsonb,
  '{"general": {"isBrandingEnabled": true}}'::jsonb,
  '[{"id": "qmbhi0mk1lewbe0ez5nx45fb", "type": "start", "outgoingEdgeId": "o0yzfoahvwbn8wqdzyuz5m7n", "graphCoordinates": {"x": 0, "y": 0}}]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  "publicId" = EXCLUDED."publicId",
  version = EXCLUDED.version,
  groups = EXCLUDED.groups,
  edges = EXCLUDED.edges,
  variables = EXCLUDED.variables,
  theme = EXCLUDED.theme,
  settings = EXCLUDED.settings,
  events = EXCLUDED.events;

-- 5. Create or update published version with exact structure from working UI-created typebot
INSERT INTO "PublicTypebot" (id, "typebotId", version, groups, edges, variables, theme, settings, events)
VALUES (
  'claudia-published-id',
  'claudia-typebot-id',
  '6',
  '[{"id": "p17dxk2589q9kakiz4n1yml8", "title": "Group #1", "blocks": [{"id": "ebjca0rpwyzgpaezrg1yqx1v", "type": "text", "content": {"richText": [{"type": "p", "children": [{"text": "Hello from typebot!"}]}]}, "outgoingEdgeId": "der9u2befjm13mgdd4gul4w9"}], "graphCoordinates": {"x": 568, "y": 255}}, {"id": "yx2tckxezerelmjndugrpw1d", "title": "Group #2", "blocks": [{"id": "g420n50vye1m0j3k5m757c9s", "type": "claudia", "options": {"action": "End Flow [N1]", "topic": ""}}], "graphCoordinates": {"x": 1178, "y": 580}}]'::jsonb,
  '[{"id": "der9u2befjm13mgdd4gul4w9", "to": {"groupId": "yx2tckxezerelmjndugrpw1d"}, "from": {"blockId": "ebjca0rpwyzgpaezrg1yqx1v"}}, {"id": "o0yzfoahvwbn8wqdzyuz5m7n", "to": {"groupId": "p17dxk2589q9kakiz4n1yml8"}, "from": {"eventId": "qmbhi0mk1lewbe0ez5nx45fb"}}]'::jsonb,
  '[]'::jsonb,
  '{}'::jsonb,
  '{"general": {"isBrandingEnabled": true}}'::jsonb,
  '[{"id": "qmbhi0mk1lewbe0ez5nx45fb", "type": "start", "outgoingEdgeId": "o0yzfoahvwbn8wqdzyuz5m7n", "graphCoordinates": {"x": 0, "y": 0}}]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  "typebotId" = EXCLUDED."typebotId",
  groups = EXCLUDED.groups,
  edges = EXCLUDED.edges,
  variables = EXCLUDED.variables,
  theme = EXCLUDED.theme,
  settings = EXCLUDED.settings;
