import { Rpc, RpcClient, RpcGroup } from "@effect/rpc";
import { WorkflowsRpcClientProtocolLayer } from "@typebot.io/config/workflowsRpcProtocol";
import { Effect } from "effect";
import { StartUserOnboardingWorkflow } from "./startUserOnboardingWorkflow";

export class UsersWorkflowsRpc extends RpcGroup.make(
  Rpc.make("SendUserOnboardingEmail", {
    error: StartUserOnboardingWorkflow.errorSchema,
    payload: StartUserOnboardingWorkflow.payloadSchema,
  }),
) {}

export const UsersWorkflowsRpcLayer = UsersWorkflowsRpc.toLayer(
  Effect.succeed({
    SendUserOnboardingEmail: (payload) =>
      StartUserOnboardingWorkflow.execute(payload, {
        discard: true,
      }),
  }),
);

export class UsersWorkflowsRpcClient extends Effect.Service<UsersWorkflowsRpcClient>()(
  "@typebot/UsersWorkflowsRpcClient",
  {
    scoped: RpcClient.make(UsersWorkflowsRpc),
    dependencies: [WorkflowsRpcClientProtocolLayer],
  },
) {}
