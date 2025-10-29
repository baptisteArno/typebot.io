import type { TEventSource } from "@typebot.io/typebot/schemas/edge";
import { cn } from "@typebot.io/ui/lib/cn";
import { cx } from "@typebot.io/ui/lib/cva";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useEventListener } from "@/hooks/useEventListener";
import { useEndpoints } from "../../providers/EndpointsProvider";
import { useGraph } from "../../providers/GraphProvider";

const endpointHeight = 32;

export const EventSourceEndpoint = ({
  source,
  isHidden,
  className,
}: {
  source: TEventSource;
  isHidden?: boolean;
  className?: string;
}) => {
  const { setConnectingIds, previewingEdge, graphPosition } = useGraph();
  const { setSourceEndpointYOffset, deleteSourceEndpointYOffset } =
    useEndpoints();
  const [eventTransformProp, setEventTransformProp] = useState<string>();
  const [eventHeight, setEventHeight] = useState<number>();
  const ref = useRef<HTMLDivElement | null>(null);

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
    [graphPosition.scale, graphPosition.y, eventHeight, eventTransformProp],
  );

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      setEventHeight(entries[0].contentRect.height);
    });
    const eventElement = document.querySelector(
      `[data-moving-element="event-${source.eventId}"]`,
    );
    if (!eventElement) return;
    resizeObserver.observe(eventElement);
    return () => {
      resizeObserver.disconnect();
    };
  }, [source.eventId]);

  useLayoutEffect(() => {
    const mutationObserver = new MutationObserver((entries) => {
      setEventTransformProp((entries[0].target as HTMLElement).style.transform);
    });
    const eventElement = document.querySelector(
      `[data-moving-element="event-${source.eventId}"]`,
    );
    if (!eventElement) return;
    mutationObserver.observe(eventElement, {
      attributes: true,
      attributeFilter: ["style"],
    });
    return () => {
      mutationObserver.disconnect();
    };
  }, [source.eventId]);

  useEffect(() => {
    if (!endpointY) return;
    setSourceEndpointYOffset?.({
      id: source.eventId,
      y: endpointY,
    });
  }, [setSourceEndpointYOffset, endpointY, source.eventId]);

  useEffect(
    () => () => {
      deleteSourceEndpointYOffset?.(source.eventId);
    },
    [deleteSourceEndpointYOffset, source.eventId],
  );

  useEventListener(
    "pointerdown",
    (e) => {
      e.stopPropagation();
      setConnectingIds({ source });
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
        "flex size-[32px] rounded-full justify-center items-center cursor-copy pointer-events-[all]",
        isHidden ? "invisible" : "visible",
        className,
      )}
      ref={ref}
    >
      <div className="flex size-[20px] justify-center items-center rounded-full bg-gray-1 border border-gray-4">
        <div
          className={cx(
            "flex size-[13px] rounded-full border-[3.5px] shadow-sm",
            previewingEdge &&
              "eventId" in previewingEdge.from &&
              previewingEdge.from.eventId === source.eventId
              ? "border-orange-8"
              : "border-orange-6",
          )}
        />
      </div>
    </div>
  );
};
