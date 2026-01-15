import { Config, Context, Effect, Layer, Redacted, Schema } from "effect";
import { createTransport, type SendMailOptions } from "nodemailer";

export class NodemailerError extends Schema.TaggedError<NodemailerError>()(
  "@typebot/NodemailerError",
  {
    cause: Schema.optional(Schema.Unknown),
  },
) {}

export class NodemailerClient extends Context.Tag("@typebot/NodemailerClient")<
  NodemailerClient,
  {
    sendMail: (
      options: SendMailOptions,
    ) => Effect.Effect<void, NodemailerError>;
  }
>() {}

export const NodemailerClientLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const transport = createTransport(
      {
        host: yield* Config.string("SMTP_HOST"),
        port: yield* Config.port("SMTP_PORT"),
        secure: yield* Config.boolean("SMTP_SECURE").pipe(
          Config.withDefault(false),
        ),
        ignoreTLS: yield* Config.boolean("SMTP_IGNORE_TLS").pipe(
          Config.withDefault(undefined),
        ),
        auth: {
          user: yield* Config.string("SMTP_USERNAME"),
          pass: Redacted.value(yield* Config.redacted("SMTP_PASSWORD")),
        },
      },
      {
        from: yield* Config.string("NEXT_PUBLIC_SMTP_FROM"),
      },
    );

    return Layer.succeed(NodemailerClient, {
      sendMail: (options: SendMailOptions) =>
        Effect.tryPromise({
          try: () => transport.sendMail(options),
          catch: (error) => new NodemailerError({ cause: error }),
        }),
    });
  }),
);
