import type { ExportResultsWorkflowStatusChunk } from "@typebot.io/results/workflows/rpc";
import { Alert } from "@typebot.io/ui/components/Alert";
import { Button } from "@typebot.io/ui/components/Button";
import { Progress } from "@typebot.io/ui/components/Progress";
import { CheckmarkSquare02Icon } from "@typebot.io/ui/icons/CheckmarkSquare02Icon";
import { Download01Icon } from "@typebot.io/ui/icons/Download01Icon";
import { FileEmpty02Icon } from "@typebot.io/ui/icons/FileEmpty02Icon";
import { TriangleAlertIcon } from "@typebot.io/ui/icons/TriangleAlertIcon";
import { useEffect, useState } from "react";

type Props = {
  chunk: ExportResultsWorkflowStatusChunk;
  error?: string;
};
export const ExportJobProgress = ({ chunk, error }: Props) => {
  const [showEmailNote, setShowEmailNote] = useState(false);

  useEffect(() => {
    if (chunk.status !== "in_progress") return;
    const timeout = setTimeout(() => setShowEmailNote(true), 3000);
    return () => clearTimeout(timeout);
  }, [chunk.status]);
  if (error || chunk.status === "error") {
    return (
      <Alert.Root
        variant="error"
        className="animate-in fade-in-0 slide-in-from-bottom-2"
      >
        <TriangleAlertIcon />
        <Alert.Title>Error exporting results</Alert.Title>
        <Alert.Description>
          {error || (chunk.status === "error" ? chunk.message : undefined)}
        </Alert.Description>
      </Alert.Root>
    );
  }
  if (chunk?.status === "completed") {
    return (
      <div className="flex items-center gap-2 bg-card rounded-md p-4 border justify-between animate-in fade-in-0 slide-in-from-bottom-2">
        <div className="flex gap-2">
          <FileEmpty02Icon className="mt-1 size-5" />
          <p className="text-sm mr-4">{chunk?.fileUrl.split("/").pop()}</p>
        </div>
        <Button
          size="icon"
          onClick={() => {
            window.open(chunk?.fileUrl, "_blank");
          }}
        >
          <Download01Icon />
        </Button>
      </div>
    );
  }
  const progress = chunk.status === "in_progress" ? (chunk?.progress ?? 0) : 0;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Progress.Root value={progress} className="flex-1" />
        <span className="text-sm text-muted-foreground tabular-nums">
          {Math.round(progress)}%
        </span>
      </div>
      {showEmailNote && (
        <Alert.Root
          variant="success"
          className="animate-in fade-in-0 slide-in-from-bottom-2"
        >
          <CheckmarkSquare02Icon />
          <Alert.Description>
            You can close this dialog. We'll send you the file by email once
            it's ready.
          </Alert.Description>
        </Alert.Root>
      )}
    </div>
  );
};
