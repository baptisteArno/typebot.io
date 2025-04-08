import { TRPCError } from "@trpc/server";
import type { SendEmailBlock } from "@typebot.io/blocks-integrations/sendEmail/schema";
import type {
  SessionState,
  TypebotInSession,
} from "@typebot.io/chat-session/schemas";
import { decrypt } from "@typebot.io/credentials/decrypt";
import { getCredentials } from "@typebot.io/credentials/getCredentials";
import type { SmtpCredentials } from "@typebot.io/credentials/schemas";
import { render } from "@typebot.io/emails";
import { DefaultBotNotificationEmail } from "@typebot.io/emails/emails/DefaultBotNotificationEmail";
import { env } from "@typebot.io/env";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { getFileTempUrl } from "@typebot.io/lib/s3/getFileTempUrl";
import {
  byId,
  isDefined,
  isEmpty,
  isNotDefined,
  omit,
} from "@typebot.io/lib/utils";
import type { LogInSession } from "@typebot.io/logs/schemas";
import { parseAnswers } from "@typebot.io/results/parseAnswers";
import type { AnswerInSessionState } from "@typebot.io/results/schemas/answers";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { findUniqueVariable } from "@typebot.io/variables/findUniqueVariable";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { Variable } from "@typebot.io/variables/schemas";
import { createTransport } from "nodemailer";
import type Mail from "nodemailer/lib/mailer/index";
import { getTypebotWorkspaceId } from "../../../queries/getTypebotWorkspaceId";
import type { ExecuteIntegrationResponse } from "../../../types";
import { defaultFrom, defaultTransportOptions } from "./constants";

export const sendEmailSuccessDescription = "Email successfully sent";
export const sendEmailErrorDescription = "Email not sent";

const maxEmailSending = 5;

export const executeSendEmailBlock = async ({
  state,
  sessionStore,
  block,
}: {
  state: SessionState;
  sessionStore: SessionStore;
  block: SendEmailBlock;
}): Promise<ExecuteIntegrationResponse> => {
  const logs: LogInSession[] = [];
  const { options } = block;
  if (!state.typebotsQueue[0]) throw new Error("No typebot in queue");
  const {
    typebot: { id, variables },
    resultId,
    answers,
  } = state.typebotsQueue[0];
  const isPreview = !resultId;
  if (isPreview)
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: [
        {
          status: "info",
          description: "Emails are not sent in preview mode",
        },
      ],
    };

  const bodyUniqueVariable = findUniqueVariable(variables)(
    options?.body,
  )?.value;
  const body = bodyUniqueVariable
    ? stringifyUniqueVariableValueAsHtml(bodyUniqueVariable)
    : parseVariables(options?.body ?? "", {
        variables,
        sessionStore,
        isInsideHtml: !options?.isBodyCode,
      });

  if (!options?.recipients)
    return { outgoingEdgeId: block.outgoingEdgeId, logs };

  if (!options.credentialsId) {
    logs.push({
      status: "error",
      description:
        "No credentials found, make sure to configure your SMTP provider properly",
    });
    return { outgoingEdgeId: block.outgoingEdgeId, logs };
  }

  if (sessionStore.getEmailSendingCount() >= maxEmailSending)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Attempt to send more than 5 emails",
    });
  try {
    const sendEmailLogs = await sendEmail({
      typebot: { id, variables },
      answers,
      credentialsId: options.credentialsId,
      recipients: options.recipients.map((recipient) =>
        parseVariables(recipient, { variables, sessionStore }),
      ),
      subject: options.subject
        ? parseVariables(options.subject, { variables, sessionStore })
        : undefined,
      body,
      cc: options.cc
        ? options.cc.map((recipient) =>
            parseVariables(recipient, { variables, sessionStore }),
          )
        : undefined,
      bcc: options.bcc
        ? options.bcc.map((recipient) =>
            parseVariables(recipient, { variables, sessionStore }),
          )
        : undefined,
      replyTo: options.replyTo
        ? parseVariables(options.replyTo, { variables, sessionStore })
        : undefined,
      fileUrls: getFileUrls(variables)(options.attachmentsVariableId),
      isCustomBody: options.isCustomBody,
      isBodyCode: options.isBodyCode,
      workspaceId: state.workspaceId,
      sessionStore,
    });
    if (sendEmailLogs) logs.push(...sendEmailLogs);
  } catch (err) {
    logs.push(await parseUnknownError({ err, context: "While sending email" }));
  }

  sessionStore.incrementEmailSendingCount();

  return { outgoingEdgeId: block.outgoingEdgeId, logs };
};

const sendEmail = async ({
  typebot,
  answers,
  credentialsId,
  recipients,
  body,
  subject,
  cc,
  bcc,
  replyTo,
  isBodyCode,
  isCustomBody,
  fileUrls,
  workspaceId,
  sessionStore,
}: {
  credentialsId: string;
  recipients: string[];
  body: string | undefined;
  subject: string | undefined;
  cc: string[] | undefined;
  bcc: string[] | undefined;
  replyTo: string | undefined;
  isBodyCode: boolean | undefined;
  isCustomBody: boolean | undefined;
  typebot: Pick<TypebotInSession, "id" | "variables">;
  answers: AnswerInSessionState[];
  fileUrls?: string | string[];
  workspaceId: string;
  sessionStore: SessionStore;
}): Promise<LogInSession[] | undefined> => {
  const logs: LogInSession[] = [];
  const { name: replyToName } = parseEmailRecipient(replyTo);

  const { host, port, isTlsEnabled, username, password, from } =
    (await getEmailInfo(credentialsId, workspaceId)) ?? {};
  if (!from) return;

  const transportConfig = {
    host,
    port,
    secure: isTlsEnabled ?? undefined,
    auth: {
      user: username,
      pass: password,
    },
  };

  const emailBody = await getEmailBody({
    body,
    isCustomBody,
    isBodyCode,
    typebot,
    answersInSession: answers,
  });

  if (!emailBody) {
    logs.push({
      description: sendEmailErrorDescription,
      details: JSON.stringify({
        error: "No email body found",
        transportConfig,
        recipients,
        subject,
        cc,
        bcc,
        replyTo,
        emailBody,
      }),
    });
    return logs;
  }
  const transporter = createTransport(transportConfig);
  const fromName = isEmpty(replyToName) ? from.name : replyToName;
  const email: Mail.Options = {
    from: fromName ? `"${fromName}" <${from.email}>` : from.email,
    cc,
    bcc,
    to: recipients,
    replyTo,
    subject,
    attachments: await parseAttachments(fileUrls, typebot.id),
    ...emailBody,
  };

  const hash = JSON.stringify(email);
  if (sessionStore.getPrevHash() && sessionStore.getPrevHash() === hash)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Attempt to send the same email twice",
    });
  sessionStore.setPrevHash(hash);

  try {
    await transporter.sendMail(email);
    logs.push({
      status: "success",
      description: sendEmailSuccessDescription,
      details: JSON.stringify({
        transportConfig: {
          ...transportConfig,
          auth: { user: transportConfig.auth.user, pass: "******" },
        },
        email,
      }),
    });
  } catch (err) {
    logs.push({
      status: "error",
      description: sendEmailErrorDescription,
      details: JSON.stringify({
        error: err instanceof Error ? err.toString() : err,
        transportConfig: {
          ...transportConfig,
          auth: { user: transportConfig.auth.user, pass: "******" },
        },
        email,
      }),
    });
  }

  return logs;
};

const getEmailInfo = async (
  credentialsId: string,
  workspaceId: string,
): Promise<SmtpCredentials["data"] | undefined> => {
  if (credentialsId === "default")
    return {
      host: defaultTransportOptions.host,
      port: defaultTransportOptions.port,
      username: defaultTransportOptions.auth.user,
      password: defaultTransportOptions.auth.pass,
      isTlsEnabled: undefined,
      from: defaultFrom,
    };
  const credentials = await getCredentials(credentialsId, workspaceId);
  if (!credentials) return;
  return (await decrypt(
    credentials.data,
    credentials.iv,
  )) as SmtpCredentials["data"];
};

const getEmailBody = async ({
  body,
  isCustomBody,
  isBodyCode,
  typebot,
  answersInSession,
}: {
  typebot: Pick<TypebotInSession, "id" | "variables">;
  answersInSession: AnswerInSessionState[];
} & Pick<
  NonNullable<SendEmailBlock["options"]>,
  "isCustomBody" | "isBodyCode" | "body"
>): Promise<{ html?: string; text?: string } | undefined> => {
  if (isCustomBody || (isNotDefined(isCustomBody) && !isEmpty(body)))
    return {
      html: isBodyCode ? body : undefined,
      text: !isBodyCode ? body : undefined,
    };
  const answers = parseAnswers({
    variables: typebot.variables,
    answers: answersInSession,
  });
  return {
    html: render(
      <DefaultBotNotificationEmail
        resultsUrl={`${env.NEXTAUTH_URL}/typebots/${typebot.id}/results`}
        answers={omit(answers, "submittedAt")}
      />,
    ).html,
  };
};

const parseEmailRecipient = (
  recipient?: string,
): { email?: string; name?: string } => {
  if (!recipient) return {};
  if (recipient.includes("<")) {
    const [name, email] = recipient.split("<");
    return {
      name: name?.replace(/>/g, "").trim().replace(/"/g, ""),
      email: email?.replace(">", "").trim(),
    };
  }
  return {
    email: recipient,
  };
};

const getFileUrls =
  (variables: Variable[]) =>
  (variableId: string | undefined): string | string[] | undefined => {
    const fileUrls = variables.find(byId(variableId))?.value;
    if (!fileUrls) return;
    if (typeof fileUrls === "string") return fileUrls;
    return fileUrls.filter(isDefined);
  };

const stringifyUniqueVariableValueAsHtml = (
  value: Variable["value"],
): string => {
  if (!value) return "";
  if (typeof value === "string") return value.replace(/\n/g, "<br />");
  return value.map(stringifyUniqueVariableValueAsHtml).join("<br />");
};

const parseAttachments = (
  fileUrls: string | string[] | undefined,
  typebotId: string,
): Promise<{ path: string }[]> | undefined => {
  if (!fileUrls) return undefined;
  const urls = Array.isArray(fileUrls) ? fileUrls : fileUrls.split(", ");
  return Promise.all(
    urls.map(async (url) => {
      if (!url.startsWith(env.NEXTAUTH_URL)) return { path: url };
      const {
        typebotId: urlTypebotId,
        resultId,
        fileName,
      } = extractDataFromPrivateUrl(url);
      if (typebotId !== urlTypebotId) return { path: url };
      const workspaceId = await getTypebotWorkspaceId(typebotId);
      return {
        path: await getFileTempUrl({
          key: `private/workspaces/${workspaceId}/typebots/${typebotId}/results/${resultId}/${fileName}`,
          expires: 600,
        }),
      };
    }),
  );
};

const extractDataFromPrivateUrl = (url: string) => {
  const pathSegments = url.split("/").filter((segment) => segment !== "");

  const typebotId = pathSegments[4];
  const resultId = pathSegments[6];
  const fileName = pathSegments[7];

  return { typebotId, resultId, fileName };
};
