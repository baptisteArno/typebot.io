import { TRPCError } from "@trpc/server";
import type {
  SendEmailBlock,
  SmtpCredentials,
} from "@typebot.io/blocks-integrations/sendEmail/schema";
import { render } from "@typebot.io/emails";
import { DefaultBotNotificationEmail } from "@typebot.io/emails/emails/DefaultBotNotificationEmail";
import { env } from "@typebot.io/env";
import { decrypt } from "@typebot.io/lib/api/encryption/decrypt";
import { getFileTempUrl } from "@typebot.io/lib/s3/getFileTempUrl";
import {
  byId,
  isDefined,
  isEmpty,
  isNotDefined,
  omit,
} from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { parseAnswers } from "@typebot.io/results/parseAnswers";
import type { AnswerInSessionState } from "@typebot.io/results/schemas/answers";
import { findUniqueVariable } from "@typebot.io/variables/findUniqueVariableValue";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { Variable } from "@typebot.io/variables/schemas";
import { createTransport } from "nodemailer";
import type Mail from "nodemailer/lib/mailer/index";
import { getTypebotWorkspaceId } from "../../../queries/getTypebotWorkspaceId";
import type { ChatLog } from "../../../schemas/api";
import type {
  SessionState,
  TypebotInSession,
} from "../../../schemas/chatSession";
import type { ExecuteIntegrationResponse } from "../../../types";
import { defaultFrom, defaultTransportOptions } from "./constants";

export const sendEmailSuccessDescription = "Email successfully sent";
export const sendEmailErrorDescription = "Email not sent";

let prevHash: string | undefined;
let emailSendingCount = 0;
const maxEmailSending = 5;

export const executeSendEmailBlock = async (
  state: SessionState,
  block: SendEmailBlock,
): Promise<ExecuteIntegrationResponse> => {
  const logs: ChatLog[] = [];
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
    : parseVariables(variables, { isInsideHtml: !options?.isBodyCode })(
        options?.body ?? "",
      );

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

  if (emailSendingCount >= maxEmailSending)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Attempt to send more than 5 emails",
    });
  try {
    const sendEmailLogs = await sendEmail({
      typebot: { id, variables },
      answers,
      credentialsId: options.credentialsId,
      recipients: options.recipients.map(parseVariables(variables)),
      subject: options.subject
        ? parseVariables(variables)(options?.subject)
        : undefined,
      body,
      cc: options.cc ? options.cc.map(parseVariables(variables)) : undefined,
      bcc: options.bcc ? options.bcc.map(parseVariables(variables)) : undefined,
      replyTo: options.replyTo
        ? parseVariables(variables)(options.replyTo)
        : undefined,
      fileUrls: getFileUrls(variables)(options.attachmentsVariableId),
      isCustomBody: options.isCustomBody,
      isBodyCode: options.isBodyCode,
    });
    if (sendEmailLogs) logs.push(...sendEmailLogs);
  } catch (err) {
    logs.push({
      status: "error",
      details: err,
      description: `Email not sent`,
    });
  }

  emailSendingCount += 1;

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
}): Promise<ChatLog[] | undefined> => {
  const logs: ChatLog[] = [];
  const { name: replyToName } = parseEmailRecipient(replyTo);

  const { host, port, isTlsEnabled, username, password, from } =
    (await getEmailInfo(credentialsId)) ?? {};
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
      status: "error",
      description: sendEmailErrorDescription,
      details: {
        error: "No email body found",
        transportConfig,
        recipients,
        subject,
        cc,
        bcc,
        replyTo,
        emailBody,
      },
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
  if (prevHash && prevHash === hash)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Attempt to send the same email twice",
    });
  prevHash = hash;

  try {
    await transporter.sendMail(email);
    logs.push({
      status: "success",
      description: sendEmailSuccessDescription,
      details: {
        transportConfig: {
          ...transportConfig,
          auth: { user: transportConfig.auth.user, pass: "******" },
        },
        email,
      },
    });
  } catch (err) {
    logs.push({
      status: "error",
      description: sendEmailErrorDescription,
      details: {
        error: err instanceof Error ? err.toString() : err,
        transportConfig: {
          ...transportConfig,
          auth: { user: transportConfig.auth.user, pass: "******" },
        },
        email,
      },
    });
  }

  return logs;
};

const getEmailInfo = async (
  credentialsId: string,
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
  const credentials = await prisma.credentials.findUnique({
    where: { id: credentialsId },
  });
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
