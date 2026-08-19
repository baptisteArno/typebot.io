import type { ContinueChatResponse } from "@typebot.io/chat-api/schemas";
import { Standard } from "@typebot.io/react";
import { defaultBackgroundColor } from "@typebot.io/theme/constants";
import { Button } from "@typebot.io/ui/components/Button";
import { useEffect, useRef, useState } from "react";
import { useEditor } from "@/features/editor/providers/EditorProvider";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import { useUser } from "@/features/user/hooks/useUser";
import { toast } from "@/lib/toast";

export const WebPreview = () => {
  const { user } = useUser();
  const { typebot, save } = useTypebot();
  const { startPreviewFrom } = useEditor();
  const { setPreviewingBlock } = useGraph();
  const [saveAttempt, setSaveAttempt] = useState(0);
  const [saveState, setSaveState] = useState<{
    attemptKey: string;
    status: "saving" | "ready" | "failed";
  }>();
  const saveRef = useRef(save);
  const savePromiseRef = useRef<
    | {
        attemptKey: string;
        promise: ReturnType<typeof save>;
      }
    | undefined
  >(undefined);
  saveRef.current = save;

  const handleRetryClick = () => setSaveAttempt((attempt) => attempt + 1);

  const typebotId = typebot?.id;
  const previewKey = `${typebotId ?? ""}-${startPreviewFrom?.type ?? ""}-${
    startPreviewFrom?.id ?? ""
  }`;
  const saveAttemptKey = `${previewKey}-${saveAttempt}`;

  useEffect(() => {
    if (!typebotId) return;

    setSaveState({ attemptKey: saveAttemptKey, status: "saving" });
    if (savePromiseRef.current?.attemptKey !== saveAttemptKey)
      savePromiseRef.current = {
        attemptKey: saveAttemptKey,
        promise: saveRef.current(),
      };

    let isActive = true;
    savePromiseRef.current.promise.then((result) => {
      if (!isActive) return;
      setSaveState({
        attemptKey: saveAttemptKey,
        status: result === "failed" ? "failed" : "ready",
      });
    });
    return () => {
      isActive = false;
    };
  }, [saveAttemptKey, typebotId]);

  const handleNewLogs = (logs: ContinueChatResponse["logs"]) => {
    logs?.forEach((log) => {
      toast({
        title: log.context,
        type: log.status as "success" | "error" | "info",
        description: log.description,
        details: log.details,
      });
      if (log.status === "error") console.error(log);
    });
  };

  if (!typebot || saveState?.attemptKey !== saveAttemptKey) return null;

  if (saveState.status === "failed")
    return (
      <div className="flex flex-1 items-center justify-center">
        <Button variant="secondary" onClick={handleRetryClick}>
          Retry preview
        </Button>
      </div>
    );

  if (saveState.status === "saving") return null;

  return (
    <Standard
      key={`web-preview-${startPreviewFrom?.id ?? ""}`}
      typebot={typebot.id}
      isPreview
      apiHost={window.location.origin}
      sessionId={user ? `${typebot.id}-${user.id}` : undefined}
      startFrom={
        startPreviewFrom?.type === "group"
          ? { type: "group", groupId: startPreviewFrom.id }
          : startPreviewFrom?.type === "event"
            ? { type: "event", eventId: startPreviewFrom.id }
            : undefined
      }
      onNewInputBlock={(block) =>
        setPreviewingBlock({
          id: block.id,
          groupId:
            typebot.groups.find((g) => g.blocks.some((b) => b.id === block.id))
              ?.id ?? "",
        })
      }
      onNewLogs={handleNewLogs}
      style={{
        borderWidth: "1px",
        borderRadius: "0.25rem",
        backgroundColor:
          typebot.theme.general?.background?.content ??
          defaultBackgroundColor[typebot.version],
      }}
    />
  );
};
