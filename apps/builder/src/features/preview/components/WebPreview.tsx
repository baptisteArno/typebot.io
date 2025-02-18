import { useEditor } from "@/features/editor/providers/EditorProvider";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import { useUser } from "@/features/user/hooks/useUser";
import { toast } from "@/lib/toast";
import type { ContinueChatResponse } from "@typebot.io/bot-engine/schemas/api";
import { Standard } from "@typebot.io/nextjs";

export const WebPreview = () => {
  const { user } = useUser();
  const { typebot } = useTypebot();
  const { startPreviewFrom } = useEditor();
  const { setPreviewingBlock } = useGraph();

  const handleNewLogs = (logs: ContinueChatResponse["logs"]) => {
    logs?.forEach((log) => {
      toast({
        context: log.context,
        status: log.status as "success" | "error" | "info",
        description: log.description,
        details: log.details,
      });
      if (log.status === "error") console.error(log);
    });
  };

  if (!typebot) return null;

  return (
    <Standard
      key={`web-preview${startPreviewFrom?.id ?? ""}`}
      typebot={typebot}
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
      }}
    />
  );
};
