import { BotContainerContext } from "@/contexts/BotContainerContext";
import {
  ChatContainerSizeContext,
  createChatContainerProviderValue,
} from "@/contexts/ChatContainerSizeContext";
import { startChatQuery } from "@/queries/startChatQuery";
import type { BotContext } from "@/types";
import { CorsError } from "@/utils/CorsError";
import { mergeThemes } from "@/utils/dynamicTheme";
import { injectFont } from "@/utils/injectFont";
import { setCssVariablesValue } from "@/utils/setCssVariablesValue";
import {
  getExistingResultIdFromStorage,
  getInitialChatReplyFromStorage,
  setInitialChatReplyInStorage,
  setResultInStorage,
  wipeExistingChatStateInStorage,
} from "@/utils/storage";
import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import type {
  StartChatResponse,
  StartFrom,
} from "@typebot.io/chat-api/schemas";
import { isNotDefined, isNotEmpty } from "@typebot.io/lib/utils";
import type { LogInSession } from "@typebot.io/logs/schemas";
import { isTypebotVersionAtLeastV6 } from "@typebot.io/schemas/helpers/isTypebotVersionAtLeastV6";
import { defaultSettings } from "@typebot.io/settings/constants";
import {
  defaultContainerBackgroundColor,
  defaultFontFamily,
  defaultFontType,
} from "@typebot.io/theme/constants";
import type { Font } from "@typebot.io/theme/schemas";
import { cx } from "@typebot.io/ui/lib/cva";
import { HTTPError } from "ky";
import {
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js";
import { Button } from "./Button";
import { ErrorMessage } from "./ErrorMessage";
import { EmailInput } from "./inputs/EmailInput";
import { PhoneInput } from "./inputs/PhoneInput";
import { TextInput } from "./inputs/TextInput";

export type BotProps = {
  setLead: (values: { name: string; email: string; phone: string }) => void;
  id?: string;
  typebot: string | any;
  isPreview?: boolean;
  resultId?: string;
  prefilledVariables?: Record<string, unknown>;
  apiHost?: string;
  wsHost?: string;
  font?: Font;
  progressBarRef?: HTMLDivElement;
  startFrom?: StartFrom;
  sessionId?: string;
  onNewInputBlock?: (inputBlock: InputBlock) => void;
  onAnswer?: (answer: { message: string; blockId: string }) => void;
  onInit?: () => void;
  onEnd?: () => void;
  onNewLogs?: (logs: LogInSession[]) => void;
  onChatStatePersisted?: (isEnabled: boolean) => void;
  onScriptExecutionSuccess?: (message: string) => void;
};

export const BotPreForm = (props: BotProps & { class?: string }) => {
  const [initialChatReply, setInitialChatReply] = createSignal<
    StartChatResponse | undefined
  >();
  const [customCss, setCustomCss] = createSignal("");
  const [isInitialized, setIsInitialized] = createSignal(false);
  const [error, setError] = createSignal<Error | undefined>();

  const initializeBot = async () => {
    if (props.font) injectFont(props.font);
    setIsInitialized(true);
    const urlParams = new URLSearchParams(location.search);
    props.onInit?.();
    const prefilledVariables: { [key: string]: string } = {};
    urlParams.forEach((value, key) => {
      prefilledVariables[key] = value;
    });
    const typebotIdFromProps =
      typeof props.typebot === "string" ? props.typebot : undefined;
    const isPreview =
      typeof props.typebot !== "string" || (props.isPreview ?? false);
    const resultIdInStorage =
      getExistingResultIdFromStorage(typebotIdFromProps);
    const { data, error } = await startChatQuery({
      stripeRedirectStatus: urlParams.get("redirect_status") ?? undefined,
      typebot: props.typebot,
      apiHost: props.apiHost,
      isPreview,
      resultId: isNotEmpty(props.resultId) ? props.resultId : resultIdInStorage,
      prefilledVariables: {
        ...prefilledVariables,
        ...props.prefilledVariables,
      },
      startFrom: props.startFrom,
      sessionId: props.sessionId,
    });
    if (error instanceof HTTPError) {
      if (isPreview) {
        return setError(
          new Error(`An error occurred while loading the bot.`, {
            cause: {
              status: error.response.status,
              body: await error.response.json(),
            },
          }),
        );
      }
      if (error.response.status === 400 || error.response.status === 403)
        return setError(new Error((await error.response.json()).message));
      if (error.response.status === 404)
        return setError(new Error("The bot you're looking for doesn't exist."));
      return setError(
        new Error(
          `Error! Couldn't initiate the chat. (${error.response.statusText})`,
        ),
      );
    }

    if (error instanceof CorsError) {
      return setError(new Error(error.message));
    }

    if (!data) {
      if (error) {
        console.error(error);
        if (isPreview) {
          return setError(
            new Error(`Error! Could not reach server. Check your connection.`, {
              cause: error,
            }),
          );
        }
      }
      return setError(
        new Error("Error! Could not reach server. Check your connection."),
      );
    }

    if (
      data.resultId &&
      typebotIdFromProps &&
      (data.typebot.settings.general?.rememberUser?.isEnabled ??
        defaultSettings.general.rememberUser.isEnabled)
    ) {
      if (resultIdInStorage && resultIdInStorage !== data.resultId)
        wipeExistingChatStateInStorage(data.typebot.id);
      const storage =
        data.typebot.settings.general?.rememberUser?.storage ??
        defaultSettings.general.rememberUser.storage;
      setResultInStorage(storage)(typebotIdFromProps, data.resultId);
      const initialChatInStorage = getInitialChatReplyFromStorage(
        data.typebot.id,
      );
      if (
        initialChatInStorage &&
        initialChatInStorage.typebot.publishedAt &&
        data.typebot.publishedAt
      ) {
        if (
          new Date(initialChatInStorage.typebot.publishedAt).getTime() ===
          new Date(data.typebot.publishedAt).getTime()
        ) {
          setInitialChatReply(initialChatInStorage);
        } else {
          // Restart chat by resetting remembered state
          wipeExistingChatStateInStorage(data.typebot.id);
          setInitialChatReply(data);
          setInitialChatReplyInStorage(data, {
            typebotId: data.typebot.id,
            storage,
          });
        }
      } else {
        setInitialChatReply(data);
        setInitialChatReplyInStorage(data, {
          typebotId: data.typebot.id,
          storage,
        });
      }
      props.onChatStatePersisted?.(true);
    } else {
      wipeExistingChatStateInStorage(data.typebot.id);
      setInitialChatReply(data);
      if (data.input?.id && props.onNewInputBlock)
        props.onNewInputBlock(data.input);
      if (data.logs) props.onNewLogs?.(data.logs);
      props.onChatStatePersisted?.(false);
    }

    setCustomCss(data.typebot.theme.customCss ?? "");
  };

  createEffect(() => {
    if (isNotDefined(props.typebot) || isInitialized()) return;
    initializeBot().then();
  });

  createEffect(() => {
    if (isNotDefined(props.typebot) || typeof props.typebot === "string")
      return;
    setCustomCss(props.typebot.theme.customCss ?? "");
    if (
      props.typebot.theme.general?.progressBar?.isEnabled &&
      initialChatReply() &&
      !initialChatReply()?.typebot.theme.general?.progressBar?.isEnabled
    ) {
      setIsInitialized(false);
      initializeBot().then();
    }
  });

  onCleanup(() => {
    setIsInitialized(false);
  });

  return (
    <>
      <Show when={customCss()}>{(css) => <style>{css()}</style>}</Show>

      <Show
        when={error()}
        keyed
      >
        {(error) => <ErrorMessage error={error} />}
      </Show>

      <Show
        when={initialChatReply()}
        keyed
      >
        {(initialChatReply) => (
          <BotContent
            setLead={props.setLead}
            class={props.class}
            initialChatReply={{
              ...initialChatReply,
              typebot: {
                ...initialChatReply.typebot,
                settings:
                  typeof props.typebot === "string" || !props.typebot
                    ? initialChatReply.typebot.settings
                    : props.typebot?.settings,
                theme:
                  typeof props.typebot === "string" || !props.typebot
                    ? initialChatReply.typebot.theme
                    : props.typebot?.theme,
              },
            }}
            context={{
              apiHost: props.apiHost,
              wsHost: props.wsHost,
              isPreview:
                typeof props.typebot !== "string" || (props.isPreview ?? false),
              resultId: initialChatReply.resultId,
              sessionId: initialChatReply.sessionId,
              typebot: initialChatReply.typebot,
              storage:
                initialChatReply.typebot.settings.general?.rememberUser
                  ?.isEnabled &&
                !(
                  typeof props.typebot !== "string" ||
                  (props.isPreview ?? false)
                )
                  ? (initialChatReply.typebot.settings.general?.rememberUser
                      ?.storage ?? defaultSettings.general.rememberUser.storage)
                  : undefined,
            }}
            progressBarRef={props.progressBarRef}
            onNewInputBlock={props.onNewInputBlock}
            onNewLogs={props.onNewLogs}
            onAnswer={props.onAnswer}
            onEnd={props.onEnd}
            onScriptExecutionSuccess={props.onScriptExecutionSuccess}
          />
        )}
      </Show>
    </>
  );
};

type BotContentProps = {
  setLead: (values: { name: string; email: string; phone: string }) => void;
  initialChatReply: StartChatResponse;
  context: BotContext;
  class?: string;
  progressBarRef?: HTMLDivElement;
  onNewInputBlock?: (inputBlock: InputBlock) => void;
  onAnswer?: (answer: { message: string; blockId: string }) => void;
  onEnd?: () => void;
  onNewLogs?: (logs: LogInSession[]) => void;
  onScriptExecutionSuccess?: (message: string) => void;
};

const BotContent = (props: BotContentProps) => {
  let chatContainer: HTMLDivElement | undefined;

  const [success, setSuccess] = createSignal(false);

  const [error, setError] = createSignal<{
    name: boolean;
    email: boolean;
    phone: boolean;
  }>({
    name: false,
    email: false,
    phone: false,
  });

  let botContainer: HTMLDivElement | undefined;

  let botContainerElement: HTMLDivElement | undefined;

  createEffect(() => {
    injectFont(
      props.initialChatReply.typebot.theme.general?.font ?? {
        type: defaultFontType,
        family: defaultFontFamily,
      },
    );

    if (!botContainer) {
      return;
    }

    setCssVariablesValue({
      theme: mergeThemes(
        props.initialChatReply.typebot.theme,
        props.initialChatReply.dynamicTheme,
      ),
      container: botContainer,
      isPreview: props.context.isPreview,
      typebotVersion: isTypebotVersionAtLeastV6(
        props.initialChatReply.typebot.version,
      )
        ? props.initialChatReply.typebot.version
        : "6",
    });
  });

  const botContainerHeight = createMemo(() => {
    if (!botContainer) return "100%";
    return botContainer.clientHeight;
  });

  const chatContainerSize = createChatContainerProviderValue(
    () => chatContainer,
  );

  const isChatContainerTransparent = createMemo(
    () =>
      (props.initialChatReply.typebot.theme.chat?.container?.backgroundColor ??
        defaultContainerBackgroundColor) === "transparent",
  );

  const onSubmit = (e: Event) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;

    if (!name || !email || !phone) {
      console.log({
        name: !name,
        email: !email,
        phone: !phone,
      });

      setError({
        name: !name,
        email: !email,
        phone: !phone,
      });

      return;
    }

    setError({
      name: false,
      email: false,
      phone: false,
    });

    setSuccess(true);

    setTimeout(() => {
      props.setLead({
        name,
        email,
        phone,
      });
    }, 750);
  };

  return (
    <BotContainerContext.Provider value={() => botContainer}>
      <div
        ref={botContainer}
        class={cx(
          "relative flex w-full overflow-hidden h-full text-base flex-col justify-center items-center typebot-container",
          props.class,
        )}
        style={{
          "--bot-container-height": botContainerHeight(),
        }}
      >
        <ChatContainerSizeContext.Provider value={chatContainerSize}>
          <div
            class={cx(
              "w-full h-full px-[calc((100%-var(--typebot-chat-container-max-width))/2)]",
              // If chat container is transparent, we make sure the scroll area takes the entire width of the container
              isChatContainerTransparent()
                ? "overflow-y-auto scroll-smooth scrollable-container"
                : undefined,
            )}
            style={{
              padding: "15px",
              "padding-bottom": "0px",
              flex: 1,
              height: "100%",
              overflow: "auto",
            }}
          >
            <div
              ref={chatContainer}
              style={{
                "border-radius": "15px",
                background: "#fff",
                height: "100%",
              }}
            >
              <div class="w-full flex flex-col">
                <div
                  class={cx(
                    "@container relative typebot-chat-view w-full min-h-full flex flex-col items-center @xs:min-h-chat-container @xs:max-h-chat-container @xs:rounded-chat-container pt-5  max-w-chat-container h-full",
                  )}
                  style={{
                    "border-radius": "10px",
                    padding: "0",
                    width: "100%",
                    "border-bottom-left-radius": "0",
                    "border-bottom-right-radius": "0",
                  }}
                >
                  <div
                    class="relative px-2 text-center"
                    style={{
                      // background:
                      //   props.context.typebot.theme.chat?.container?.backgroundColor,
                      "border-radius": "16px",
                      "border-bottom-left-radius": 0,
                      "border-bottom-right-radius": 0,
                      position: "relative",
                      transition: "margin 0.5s ease-in-out",
                      height: "auto",
                      "padding-top": "60px",
                      "padding-bottom": "65px",
                      "margin-top": success() ? "-500px" : "0",
                    }}
                  >
                    {!success() && (
                      <h1 class="text-3xl font-extrabold text-gray-900">
                        Olá! <span class="inline-block">👋</span> Vamos
                        conversar?
                      </h1>
                    )}

                    {!success() && (
                      <p class="text-sm text-gray-700 mt-2">
                        Que bom te ver, estou pronto para te ajudar!
                        <br />
                        Vamos juntos encontrar o que você precisa?
                      </p>
                    )}

                    {!success() && (
                      <div
                        class="flex items-center bg-gray-100 text-sm font-semibold rounded-full px-4 py-2 -mt-4 mx-6 shadow w-fit"
                        style={{
                          "z-index": 99999,
                          background: "#F0F0F0",
                          "font-size": "12px",
                          position: "absolute",
                          bottom: "-20px",
                          padding: "5px",
                          "padding-right": "8px",
                          "justify-self": "anchor-center",
                          color: "var(--typebot-input-color)",
                        }}
                      >
                        <span class="w-6 h-6 rounded-full bg-lime-300 flex items-center justify-center text-lg mr-2">
                          💬
                        </span>
                        Preencha os campos abaixo para iniciar
                      </div>
                    )}
                  </div>
                </div>

                <div
                  // class="overflow-y-auto relative scrollable-container scroll-smooth w-full flex flex-col items-center"
                  style={{
                    flex: 1,
                    background: "#fff",
                  }}
                >
                  <div class="max-w-chat-container w-full flex flex-col gap-2">
                    {!success() && (
                      <form
                        onSubmit={onSubmit}
                        class="px-6 space-y-4"
                        style={{
                          "padding-top": "30px",
                        }}
                      >
                        <div>
                          <label
                            for="name"
                            class="block text-sm font-semibold text-gray-800 mb-1"
                          >
                            Seu nome{" "}
                            <span class="text-sm font-normal text-gray-500">
                              (ou como gosta de ser chamado 😉)
                            </span>
                          </label>

                          <TextInput
                            name="name"
                            error={error().name}
                            context={props.context}
                          />

                          {error().name && (
                            <div
                              class="flex items-center text-red-600 text-xs"
                              style={{
                                color: "#FF4949",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.591c.75 1.334-.214 2.99-1.742 2.99H3.48c-1.528 0-2.492-1.656-1.742-2.99L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-2a.75.75 0 01-.75-.75V8a.75.75 0 011.5 0v2.25c0 .414-.336.75-.75.75z"
                                  clip-rule="evenodd"
                                />
                              </svg>

                              <span>Ops! O seu nome não foi informado.</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label
                            for="email"
                            class="block text-sm font-semibold text-gray-800 mb-1"
                          >
                            Seu e-mail{" "}
                            <span class="text-sm font-normal text-gray-500">
                              (aquele que você sempre usa)
                            </span>
                          </label>

                          {/* <div>
                  <div class="max-w-md mx-auto font-sans">
                    <label class="block text-gray-900 font-semibold text-sm mb-1">
                      Seu e-mail
                      <span class="font-normal text-gray-500">
                        (aquele que você sempre usa)
                      </span>
                    </label>

                    <input
                      type="email"
                      value="jorge@xyzconcessionaria..com.br"
                      class="w-full px-4 py-3 rounded-2xl bg-gray-100 text-red-600 border-2 border-red-500 focus:outline-none"
                      readonly
                    />
                  </div>
                </div> */}

                          <EmailInput
                            name="email"
                            error={error().email}
                            context={props.context}
                          />

                          {error().email && (
                            <div
                              class="flex items-center text-red-600 text-xs"
                              style={{
                                color: "#FF4949",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.591c.75 1.334-.214 2.99-1.742 2.99H3.48c-1.528 0-2.492-1.656-1.742-2.99L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-2a.75.75 0 01-.75-.75V8a.75.75 0 011.5 0v2.25c0 .414-.336.75-.75.75z"
                                  clip-rule="evenodd"
                                />
                              </svg>

                              <span>
                                Ops! O e-mail informado parece estar incorreto.
                              </span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label
                            for="phone"
                            class="block text-sm font-semibold text-gray-800 mb-1"
                          >
                            Seu telefone{" "}
                            <span class="text-sm font-normal text-gray-500">
                              (com DDD)
                            </span>
                          </label>

                          <PhoneInput
                            name="phone"
                            error={error().phone}
                            context={props.context}
                            defaultCountryCode="BR"
                          />

                          {error().phone && (
                            <div
                              class="flex items-center text-red-600 text-xs"
                              style={{
                                color: "#FF4949",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.591c.75 1.334-.214 2.99-1.742 2.99H3.48c-1.528 0-2.492-1.656-1.742-2.99L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-2a.75.75 0 01-.75-.75V8a.75.75 0 011.5 0v2.25c0 .414-.336.75-.75.75z"
                                  clip-rule="evenodd"
                                />
                              </svg>

                              <span>
                                Ops! O telefone informado parece estar
                                incorreto.
                              </span>
                            </div>
                          )}
                        </div>

                        <Button
                          type="submit"
                          fullWidth
                        >
                          Iniciar conversa
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ChatContainerSizeContext.Provider>

        <div
          style={{
            display: "flex",
            "align-self": "center",
            "align-items": "center",
            gap: "10px",
            color: "#777777",
            "font-size": "10px",
            width: "100%",
            height: "40px",
            "justify-content": "center",
          }}
        >
          <span>Um produto</span>

          <span>
            <img
              src="https://leadfy.me/wp-content/uploads/2025/02/logoLeadFy.svg"
              style={{ width: "50px" }}
              alt="Leadfy Logo"
            />
          </span>
        </div>
      </div>
    </BotContainerContext.Provider>
  );
};
