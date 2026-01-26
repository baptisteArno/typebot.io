import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "@effect/platform";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { Effect, Layer, Option, Redacted } from "effect";
import { RPC_SECRET_HEADER_KEY } from "./constants";
import { WorkflowsRpcClientConfig } from "./index";

export const WorkflowsRpcClientProtocolLayer = Effect.gen(function* () {
  const { rpcSecret, rpcUrl } = yield* WorkflowsRpcClientConfig;
  return RpcClient.layerProtocolHttp({
    url: Option.getOrElse(
      rpcUrl,
      () => new URL("http://localhost:3007/rpc"),
    ).toString(),
    transformClient: (client) =>
      HttpClient.mapRequest(client, (request) =>
        request.pipe(
          HttpClientRequest.setHeader(
            RPC_SECRET_HEADER_KEY,
            Redacted.value(rpcSecret),
          ),
        ),
      ),
  });
}).pipe(
  Layer.unwrapEffect,
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(RpcSerialization.layerNdjson),
);
