import type { BlockSource } from "@typebot.io/typebot/schemas/edge";
import { cn } from "@typebot.io/ui/lib/cn";
import { cx } from "@typebot.io/ui/lib/cva";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useEventListener } from "@/hooks/useEventListener";
import { useEndpoints } from "../../providers/EndpointsProvider";
import { useGraph } from "../../providers/GraphProvider";

const endpointHeight = 32;

export const BlockSourceEndpoint = ({
  source,
  groupId,
  isHidden,
  className,
}: {
  source: BlockSource;
  groupId: string;
  isHidden?: boolean;
  className?: string;
}) => {
  const id = source.pathId ?? source.itemId ?? source.blockId;
  const { setConnectingIds, previewingEdge, graphPosition } = useGraph();
  const { setSourceEndpointYOffset, deleteSourceEndpointYOffset } =
    useEndpoints();
  const ref = useRef<HTMLDivElement | null>(null);
  const [groupHeight, setGroupHeight] = useState<number>();
  const [groupTransformProp, setGroupTransformProp] = useState<string>();

  const endpointY = useMemo(
    () =>
      ref.current
        ? Number(
            (
              (ref.current?.getBoundingClientRect().y +
                (endpointHeight * graphPosition.scale) / 2 -
                graphPosition.y) /
              graphPosition.scale
            ).toFixed(2),
          )
        : undefined,
    // We need to force recompute whenever the group height and position changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graphPosition.scale, graphPosition.y, groupHeight, groupTransformProp],
  );

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      setGroupHeight(entries[0].contentRect.height);
    });
    const groupElement = document.getElementById(`group-${groupId}`);
    if (!groupElement) return;
    resizeObserver.observe(groupElement);
    return () => {
      resizeObserver.disconnect();
    };
  }, [groupId]);

  useLayoutEffect(() => {
    const mutationObserver = new MutationObserver((entries) => {
      setGroupTransformProp((entries[0].target as HTMLElement).style.transform);
    });
    const groupElement = document.getElementById(`group-${groupId}`);
    if (!groupElement) return;
    mutationObserver.observe(groupElement, {
      attributes: true,
      attributeFilter: ["style"],
    });
    return () => {
      mutationObserver.disconnect();
    };
  }, [groupId]);

  useEffect(() => {
    if (!endpointY) return;
    setSourceEndpointYOffset?.({
      id,
      y: endpointY,
    });
  }, [setSourceEndpointYOffset, endpointY, id]);

  useEffect(
    () => () => {
      deleteSourceEndpointYOffset?.(id);
    },
    [deleteSourceEndpointYOffset, id],
  );

  useEventListener(
    "pointerdown",
    (e) => {
      e.stopPropagation();
      if (groupId) setConnectingIds({ source: { ...source, groupId } });
    },
    ref,
  );

  useEventListener(
    "mousedown",
    (e) => {
      e.stopPropagation();
    },
    ref,
  );

  return (
    <div
      className={cn(
        "flex size-[32px] rounded-full justify-center items-center pointer-events-[all] cursor-copy",
        isHidden ? "invisible" : "visible",
        className,
      )}
      ref={ref}
      data-testid="endpoint"
    >
      <div className="flex size-[20px] justify-center items-center border rounded-full bg-gray-1 border-gray-4">
        <div
          className={cx(
            "flex size-[13px] rounded-full border-[3.5px] shadow-sm",
            previewingEdge &&
              "blockId" in previewingEdge.from &&
              previewingEdge.from.blockId === source.blockId &&
              previewingEdge.from.itemId === source.itemId &&
              previewingEdge.from.pathId === source.pathId
              ? "border-orange-8"
              : "border-orange-5",
          )}
        />
      </div>
    </div>
  );
};
