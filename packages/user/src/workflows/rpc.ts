import { WorkflowsRpcClientProtocolLayer } from "@typebot.io/config/workflowsRpcProtocol";
import { Effect, Layer, ServiceMap } from "effect";
import {
  Rpc,
  RpcClient,
  type RpcClientError,
  RpcGroup,
} from "effect/unstable/rpc";
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
      }).pipe(Effect.asVoid),
  }),
);

export class UsersWorkflowsRpcClient extends ServiceMap.Service<
  UsersWorkflowsRpcClient,
  RpcClient.RpcClient<
    RpcGroup.Rpcs<typeof UsersWorkflowsRpc>,
    RpcClientError.RpcClientError
  >
>()("@typebot/UsersWorkflowsRpcClient") {
  static readonly layer = Layer.effect(
    UsersWorkflowsRpcClient,
    RpcClient.make(UsersWorkflowsRpc),
  ).pipe(Layer.provide(WorkflowsRpcClientProtocolLayer));
}

export const UsersWorkflowsRpcClientLayer = UsersWorkflowsRpcClient.layer;
