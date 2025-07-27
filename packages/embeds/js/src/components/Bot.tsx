import { BotContainerContext } from "@/contexts/BotContainerContext";
import { startChatQuery } from "@/queries/startChatQuery";
import type { BotContext } from "@/types";
import { CorsError } from "@/utils/CorsError";
import { mergeThemes } from "@/utils/dynamicTheme";
import { injectFont } from "@/utils/injectFont";
import {
  getLocalizedInitialChatReplyFromStorage,
  getLocalizedResultIdFromStorage,
  migrateToLocalizedStorage,
  setLocalizedInitialChatReplyInStorage,
  setLocalizedResultIdInStorage,
  setPreferredLocaleInStorage,
  wipeLocalizedChatStateInStorage,
} from "@/utils/localizedStorage";
import { persist } from "@/utils/persist";
import { setCssVariablesValue } from "@/utils/setCssVariablesValue";
import {
  getExistingResultIdFromStorage,
  getInitialChatReplyFromStorage,
  setInitialChatReplyInStorage,
  setResultInStorage,
  wipeExistingChatStateInStorage,
} from "@/utils/storage";
import { toaster } from "@/utils/toaster";
import { Toast, Toaster } from "@ark-ui/solid";
import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import type {
  StartChatResponse,
  StartFrom,
  StartTypebot,
} from "@typebot.io/chat-api/schemas";
import { isDefined, isNotDefined, isNotEmpty } from "@typebot.io/lib/utils";
import type { LogInSession } from "@typebot.io/logs/schemas";
import { isTypebotVersionAtLeastV6 } from "@typebot.io/schemas/helpers/isTypebotVersionAtLeastV6";
import {
  defaultSettings,
  defaultSystemMessages,
} from "@typebot.io/settings/constants";
import {
  defaultFontFamily,
  defaultFontType,
  defaultProgressBarPosition,
} from "@typebot.io/theme/constants";
import type { Font } from "@typebot.io/theme/schemas";
import { cn } from "@typebot.io/ui/lib/cn";
import { cx } from "@typebot.io/ui/lib/cva";
import { HTTPError } from "ky";
import { Show, createEffect, createSignal, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";
import { detectClientLocale } from "../utils/localeDetection";
import {
  cleanupLocalizationPerformance,
  initializeLocalizationPerformance,
} from "../utils/localizationPerformance";
import { buttonVariants } from "./Button";
import { ChatContainer } from "./ConversationContainer/ChatContainer";
import { ErrorMessage } from "./ErrorMessage";
import { LiteBadge } from "./LiteBadge";
import { ProgressBar } from "./ProgressBar";
import { CloseIcon } from "./icons/CloseIcon";

// Local type definition for locale detection config (avoids import issues)
export interface LocaleDetectionConfig {
  enabled?: boolean;
  methods?: string[];
  fallbackLocale?: string;
  urlParamName?: string;
  pathSegmentIndex?: number;
  customVariableName?: string;
}

export type BotProps = {
  id?: string;
  typebot: string | StartTypebot | undefined;
  isPreview?: boolean;
  resultId?: string;
  prefilledVariables?: Record<string, unknown>;
  apiHost?: string;
  wsHost?: string;
  font?: Font;
  progressBarRef?: HTMLDivElement;
  startFrom?: StartFrom;
  sessionId?: string;
  locale?: string;
  availableLocales?: string[];
  localeDetectionMeta?: any;
  localeDetectionConfig?: LocaleDetectionConfig;
  onNewInputBlock?: (inputBlock: InputBlock) => void;
  onAnswer?: (answer: { message: string; blockId: string }) => void;
  onInit?: () => void;
  onEnd?: () => void;
  onNewLogs?: (logs: LogInSession[]) => void;
  onChatStatePersisted?: (isEnabled: boolean) => void;
  onScriptExecutionSuccess?: (message: string) => void;
};

export const Bot = (props: BotProps & { class?: string }) => {
  const [initialChatReply, setInitialChatReply] = createSignal<
    StartChatResponse | undefined
  >();
  const [customCss, setCustomCss] = createSignal("");
  const [isInitialized, setIsInitialized] = createSignal(false);
  const [error, setError] = createSignal<Error | undefined>();

  const initializeBot = async () => {
    // Initialize performance optimizations
    initializeLocalizationPerformance();

    if (props.font) injectFont(props.font);
    setIsInitialized(true);
    const urlParams = new URLSearchParams(location.search);
    props.onInit?.();
    const prefilledVariables: { [key: string]: string } = {};
    urlParams.forEach((value, key) => {
      prefilledVariables[key] = value;
    });

    // Client-side locale detection if not provided
    let detectedLocale = props.locale;
    let detectionMeta = props.localeDetectionMeta;
    let availableLocales = props.availableLocales;
    
    if (
      !detectedLocale &&
      props.localeDetectionConfig &&
      props.availableLocales
    ) {
      const detection = detectClientLocale(
        props.localeDetectionConfig,
        props.availableLocales,
      );
      detectedLocale = detection.locale;
      detectionMeta = {
        method: detection.method,
        confidence: detection.confidence,
        fallbackUsed: detection.fallbackUsed,
        clientSide: true,
      };
      availableLocales = props.availableLocales;
    }
    const typebotIdFromProps =
      typeof props.typebot === "string" ? props.typebot : undefined;
    const isPreview =
      typeof props.typebot !== "string" || (props.isPreview ?? false);

    // Use localized storage if locale is available
    const resultIdInStorage =
      detectedLocale && typebotIdFromProps
        ? getLocalizedResultIdFromStorage(typebotIdFromProps, detectedLocale) ||
          getExistingResultIdFromStorage(typebotIdFromProps)
        : getExistingResultIdFromStorage(typebotIdFromProps);

    // Migrate existing non-localized data to localized storage if needed
    if (detectedLocale && typebotIdFromProps && !isPreview) {
      migrateToLocalizedStorage(typebotIdFromProps, detectedLocale);
    }
    
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
      locale: detectedLocale,
      availableLocales: availableLocales,
      localeDetectionMeta: detectionMeta,
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
      if (resultIdInStorage && resultIdInStorage !== data.resultId) {
        if (detectedLocale) {
          wipeLocalizedChatStateInStorage(data.typebot.id, detectedLocale);
        } else {
          wipeExistingChatStateInStorage(data.typebot.id);
        }
      }
      const storage =
        data.typebot.settings.general?.rememberUser?.storage ??
        defaultSettings.general.rememberUser.storage;

      // Store result ID with locale if available
      if (detectedLocale) {
        setLocalizedResultIdInStorage(storage)(
          typebotIdFromProps,
          detectedLocale,
          data.resultId,
        );
        // Save locale preference
        setPreferredLocaleInStorage(detectedLocale, typebotIdFromProps);
      } else {
        setResultInStorage(storage)(typebotIdFromProps, data.resultId);
      }

      const initialChatInStorage = detectedLocale
        ? getLocalizedInitialChatReplyFromStorage(
            data.typebot.id,
            detectedLocale,
          ) || getInitialChatReplyFromStorage(data.typebot.id)
        : getInitialChatReplyFromStorage(data.typebot.id);
      if (
        initialChatInStorage &&
        initialChatInStorage.typebot.publishedAt &&
        data.typebot.publishedAt
      ) {
        if (
          new Date(initialChatInStorage.typebot.publishedAt).getTime() ===
          new Date(data.typebot.publishedAt).getTime()
        ) {
          setInitialChatReply({
            ...initialChatInStorage,
            sessionId: data.sessionId,
          });
        } else {
          // Restart chat by resetting remembered state
          if (detectedLocale) {
            wipeLocalizedChatStateInStorage(data.typebot.id, detectedLocale);
          } else {
            wipeExistingChatStateInStorage(data.typebot.id);
          }
          setInitialChatReply(data);

          if (detectedLocale) {
            setLocalizedInitialChatReplyInStorage(data, {
              typebotId: data.typebot.id,
              locale: detectedLocale,
              storage,
            });
          } else {
            setInitialChatReplyInStorage(data, {
              typebotId: data.typebot.id,
              storage,
            });
          }
        }
      } else {
        setInitialChatReply(data);

        if (detectedLocale) {
          setLocalizedInitialChatReplyInStorage(data, {
            typebotId: data.typebot.id,
            locale: detectedLocale,
            storage,
          });
        } else {
          setInitialChatReplyInStorage(data, {
            typebotId: data.typebot.id,
            storage,
          });
        }
      }
      props.onChatStatePersisted?.(true);
    } else {
      if (detectedLocale) {
        wipeLocalizedChatStateInStorage(data.typebot.id, detectedLocale);
      } else {
        wipeExistingChatStateInStorage(data.typebot.id);
      }
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
    cleanupLocalizationPerformance();
  });

  return (
    <>
      <Show when={customCss()}>{(css) => <style>{css()}</style>}</Show>
      <Show when={error()} keyed>
        {(error) => <ErrorMessage error={error} />}
      </Show>
      <Show when={initialChatReply()} keyed>
        {(initialChatReply) => (
          <BotContent
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
  const [progressValue, setProgressValue] = persist(
    createSignal<number | undefined>(props.initialChatReply.progress),
    {
      storage: props.context.storage,
      key: `typebot-${props.context.typebot.id}-progressValue`,
    },
  );
  let botContainer: HTMLDivElement | undefined;

  const [botContainerHeight, setBotContainerHeight] = createSignal("100%");
  createEffect(() => {
    if (!botContainer) return;
    setBotContainerHeight(`${botContainer.clientHeight}px`);
  });

  createEffect(() => {
    injectFont(
      props.initialChatReply.typebot.theme.general?.font ?? {
        type: defaultFontType,
        family: defaultFontFamily,
      },
    );
    if (!botContainer) return;
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
        <Show
          when={
            isDefined(progressValue()) &&
            props.initialChatReply.typebot.theme.general?.progressBar?.isEnabled
          }
        >
          <Show
            when={
              props.progressBarRef &&
              (props.initialChatReply.typebot.theme.general?.progressBar
                ?.position ?? defaultProgressBarPosition) === "fixed"
            }
            fallback={<ProgressBar value={progressValue() as number} />}
          >
            <Portal mount={props.progressBarRef}>
              <ProgressBar value={progressValue() as number} />
            </Portal>
          </Show>
        </Show>
        <ChatContainer
          context={props.context}
          initialChatReply={props.initialChatReply}
          onNewInputBlock={props.onNewInputBlock}
          onAnswer={props.onAnswer}
          onEnd={props.onEnd}
          onNewLogs={props.onNewLogs}
          onProgressUpdate={setProgressValue}
          onScriptExecutionSuccess={props.onScriptExecutionSuccess}
        />
        <Show
          when={
            props.initialChatReply.typebot.settings.general?.isBrandingEnabled
          }
        >
          <LiteBadge botContainer={botContainer} />
        </Show>
        <Toaster toaster={toaster} class="w-full">
          {(toast) => (
            <Toast.Root class="flex flex-col pl-4 py-4 pr-8 gap-2 max-w-[350px] rounded-chat text-input-text border-input border-input-border bg-input-bg shadow-input data-[state=open]:animate-fade-in-from-bottom data-[state=closed]:animate-fade-out-from-bottom">
              <Toast.Title class="font-semibold">{toast().title}</Toast.Title>
              <Toast.Description class="text-sm">
                {toast().description}
              </Toast.Description>
              <Toast.CloseTrigger
                class={cn(
                  "absolute right-2 top-2",
                  buttonVariants({ variant: "secondary", size: "icon" }),
                )}
              >
                <CloseIcon class="w-4 h-4" />
              </Toast.CloseTrigger>
              <Show when={toast().meta?.link as string}>
                {(link) => (
                  <a
                    href={link()}
                    target="_blank"
                    class={cn(
                      buttonVariants({ variant: "primary", size: "sm" }),
                      "no-underline",
                    )}
                    rel="noreferrer"
                  >
                    {props.initialChatReply.typebot.settings.general
                      ?.systemMessages?.popupBlockedButtonLabel ??
                      defaultSystemMessages.popupBlockedButtonLabel}
                  </a>
                )}
              </Show>
            </Toast.Root>
          )}
        </Toaster>
      </div>
    </BotContainerContext.Provider>
  );
};
