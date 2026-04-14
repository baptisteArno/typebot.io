-- Typebot seeding SQL script based on manually created flow cmip1n8ty0001kuwtyn0o5la1
-- 1. Create user if not exists
INSERT INTO "User" (id, email, name, "emailVerified", "onboardingCategories")
SELECT 'claudia-user-id', 'claudia@acme.inc', 'Claudia System User', NOW(), '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE email = 'claudia@acme.inc');

-- 1b. Create additional users matching CloudChat seed (for embedded auth in dev)
INSERT INTO "User" (id, email, name, "emailVerified", "onboardingCategories")
SELECT
  'john-user-id'  AS id,
  'john@acme.inc' AS email,
  'John'          AS name,
  NOW()           AS "emailVerified",
  '[]'::jsonb     AS "onboardingCategories"
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE email = 'john@acme.inc');

INSERT INTO "User" (id, email, name, "emailVerified", "onboardingCategories")
SELECT
  'olivia-user-id'  AS id,
  'olivia@acme.inc' AS email,
  'Olivia'          AS name,
  NOW()             AS "emailVerified",
  '[]'::jsonb       AS "onboardingCategories"
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE email = 'olivia@acme.inc');

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

-- 3b. Add CloudChat users to workspace
INSERT INTO "MemberInWorkspace" ("userId", "workspaceId", role)
SELECT
  'john-user-id'         AS "userId",
  'claudia-workspace-id' AS "workspaceId",
  'ADMIN'                AS role
WHERE NOT EXISTS (
  SELECT 1 FROM "MemberInWorkspace"
  WHERE "userId" = 'john-user-id' AND "workspaceId" = 'claudia-workspace-id'
);

INSERT INTO "MemberInWorkspace" ("userId", "workspaceId", role)
SELECT
  'olivia-user-id'       AS "userId",
  'claudia-workspace-id' AS "workspaceId",
  'ADMIN'                AS role
WHERE NOT EXISTS (
  SELECT 1 FROM "MemberInWorkspace"
  WHERE "userId" = 'olivia-user-id' AND "workspaceId" = 'claudia-workspace-id'
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
ON CONFLICT (id) DO NOTHING;

-- 4b. Create "Get Order Status" tool-type typebot (exposed via MCP)
INSERT INTO "Typebot" (id, name, "workspaceId", "publicId", version, groups, edges, variables, theme, settings, events, "toolDescription", tenant)
VALUES (
  'get-order-status-tool-id',
  'Get Order Status',
  'claudia-workspace-id',
  'get-order-status-bqgj13c',
  '6',
  '[{"id": "vlvx3yfsvjxrfn2obrd8fe4d", "title": "Captura o numero do pedido do cliente", "blocks": [{"id": "nrvf9rvbdq6wthjz5i3ifxc3", "type": "Declare variables", "outgoingEdgeId": "msnlks3o29wm45a6qiyo56a2", "options": {"variables": [{"variableId": "vbhmqwrbp80wbflf598bulicr", "description": "Numero do pedido do cliente", "required": true}]}}], "graphCoordinates": {"x": 338.46, "y": -105.89}}, {"id": "sl83xjejv2vlelkoshgjx5k3", "title": "Conseguir status", "blocks": [{"id": "thd2s19wujmpv9u26azv3fn7", "type": "Webhook", "outgoingEdgeId": "k8z6rzrsulshbej9zrx2d5cx", "options": {"variablesForTest": [{"id": "e60buzy63h74c47o0wixnf1l"}], "isAdvancedConfig": true, "isCustomBody": true, "webhook": {"url": "https://pnqwzhnyl3llssp4gubtyw5kue0thern.lambda-url.us-east-1.on.aws/", "body": "{\"orderNumber\": \"{{idPedido}}\"}"}}}], "graphCoordinates": {"x": 750.14, "y": -122.53}}, {"id": "rvubb4h2ll94req9q590z64r", "title": "Retorna infos", "blocks": [{"id": "yw9notqt8fwumohxu6ak24tz", "type": "workflow", "options": {"action": "Return Output", "responseType": "Custom JSON", "customJson": "{}"}}], "graphCoordinates": {"x": 1148.19, "y": -119.56}}]'::jsonb,
  '[{"id": "e69c5a6m47azu1uzjpsvek64", "from": {"eventId": "ric2dls1axu8xy1i1a359a75"}, "to": {"groupId": "vlvx3yfsvjxrfn2obrd8fe4d"}}, {"id": "msnlks3o29wm45a6qiyo56a2", "from": {"blockId": "nrvf9rvbdq6wthjz5i3ifxc3"}, "to": {"groupId": "sl83xjejv2vlelkoshgjx5k3"}}, {"id": "k8z6rzrsulshbej9zrx2d5cx", "from": {"blockId": "thd2s19wujmpv9u26azv3fn7"}, "to": {"groupId": "rvubb4h2ll94req9q590z64r"}}]'::jsonb,
  '[{"id": "vbhmqwrbp80wbflf598bulicr", "name": "idPedido", "isSessionVariable": true}]'::jsonb,
  '{}'::jsonb,
  '{"general": {"type": "TOOL"}}'::jsonb,
  '[{"id": "ric2dls1axu8xy1i1a359a75", "type": "start", "outgoingEdgeId": "e69c5a6m47azu1uzjpsvek64", "graphCoordinates": {"x": 0, "y": 0}}]'::jsonb,
  'Busca status do pedido atraves do numero do pedido do cliente.',
  'claudia_project'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Create or update published version of eddie-default typebot
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
ON CONFLICT (id) DO NOTHING;

-- 5b. Create published version of "Get Order Status" tool typebot
INSERT INTO "PublicTypebot" (id, "typebotId", version, groups, edges, variables, theme, settings, events)
VALUES (
  'get-order-status-published-id',
  'get-order-status-tool-id',
  '6',
  '[{"id": "vlvx3yfsvjxrfn2obrd8fe4d", "title": "Captura o numero do pedido do cliente", "blocks": [{"id": "nrvf9rvbdq6wthjz5i3ifxc3", "type": "Declare variables", "outgoingEdgeId": "msnlks3o29wm45a6qiyo56a2", "options": {"variables": [{"variableId": "vbhmqwrbp80wbflf598bulicr", "description": "Numero do pedido do cliente", "required": true}]}}], "graphCoordinates": {"x": 338.46, "y": -105.89}}, {"id": "sl83xjejv2vlelkoshgjx5k3", "title": "Conseguir status", "blocks": [{"id": "thd2s19wujmpv9u26azv3fn7", "type": "Webhook", "outgoingEdgeId": "k8z6rzrsulshbej9zrx2d5cx", "options": {"variablesForTest": [{"id": "e60buzy63h74c47o0wixnf1l"}], "isAdvancedConfig": true, "isCustomBody": true, "webhook": {"url": "https://pnqwzhnyl3llssp4gubtyw5kue0thern.lambda-url.us-east-1.on.aws/", "body": "{\"orderNumber\": \"{{idPedido}}\"}"}}}], "graphCoordinates": {"x": 750.14, "y": -122.53}}, {"id": "rvubb4h2ll94req9q590z64r", "title": "Retorna infos", "blocks": [{"id": "yw9notqt8fwumohxu6ak24tz", "type": "workflow", "options": {"action": "Return Output", "responseType": "Custom JSON", "customJson": "{}"}}], "graphCoordinates": {"x": 1148.19, "y": -119.56}}]'::jsonb,
  '[{"id": "e69c5a6m47azu1uzjpsvek64", "from": {"eventId": "ric2dls1axu8xy1i1a359a75"}, "to": {"groupId": "vlvx3yfsvjxrfn2obrd8fe4d"}}, {"id": "msnlks3o29wm45a6qiyo56a2", "from": {"blockId": "nrvf9rvbdq6wthjz5i3ifxc3"}, "to": {"groupId": "sl83xjejv2vlelkoshgjx5k3"}}, {"id": "k8z6rzrsulshbej9zrx2d5cx", "from": {"blockId": "thd2s19wujmpv9u26azv3fn7"}, "to": {"groupId": "rvubb4h2ll94req9q590z64r"}}]'::jsonb,
  '[{"id": "vbhmqwrbp80wbflf598bulicr", "name": "idPedido", "isSessionVariable": true}]'::jsonb,
  '{}'::jsonb,
  '{"general": {"type": "TOOL"}}'::jsonb,
  '[{"id": "ric2dls1axu8xy1i1a359a75", "type": "start", "outgoingEdgeId": "e69c5a6m47azu1uzjpsvek64", "graphCoordinates": {"x": 0, "y": 0}}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
