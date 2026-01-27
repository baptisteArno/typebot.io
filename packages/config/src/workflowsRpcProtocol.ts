import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "@effect/platform";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { Effect, Layer, Option, Redacted, Schedule } from "effect";
import { RPC_SECRET_HEADER_KEY } from "./constants";
import { WorkflowsRpcClientConfig } from "./index";

const workflowsRpcRetrySchedule = Schedule.exponential("200 millis").pipe(
  Schedule.jittered,
);

export const WorkflowsRpcClientProtocolLayer = Effect.gen(function* () {
  const { rpcSecret, rpcUrl } = yield* WorkflowsRpcClientConfig;
  return RpcClient.layerProtocolHttp({
    url: Option.getOrElse(
      rpcUrl,
      () => new URL("http://localhost:3007/rpc"),
    ).toString(),
    transformClient: (client) =>
      client.pipe(
        HttpClient.mapRequest((request) =>
          request.pipe(
            HttpClientRequest.setHeader(
              RPC_SECRET_HEADER_KEY,
              Redacted.value(rpcSecret),
            ),
          ),
        ),
        HttpClient.retry({
          schedule: workflowsRpcRetrySchedule,
          times: 2,
        }),
      ),
  });
}).pipe(
  Layer.unwrapEffect,
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(RpcSerialization.layerNdjson),
);
