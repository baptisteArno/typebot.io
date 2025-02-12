import {
  type BoxProps,
  Flex,
  useColorModeValue,
  useEventListener,
} from "@chakra-ui/react";
import type { TEventSource } from "@typebot.io/typebot/schemas/edge";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useEndpoints } from "../../providers/EndpointsProvider";
import { useGraph } from "../../providers/GraphProvider";

const endpointHeight = 32;

export const EventSourceEndpoint = ({
  source,
  isHidden,
  ...props
}: BoxProps & {
  source: TEventSource;
  isHidden?: boolean;
}) => {
  const color = useColorModeValue("orange.200", "orange.100");
  const connectedColor = useColorModeValue("orange.300", "orange.200");
  const bg = useColorModeValue("gray.100", "gray.700");
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
    ref.current,
  );

  useEventListener(
    "mousedown",
    (e) => {
      e.stopPropagation();
    },
    ref.current,
  );

  return (
    <Flex
      ref={ref}
      data-testid="endpoint"
      boxSize="32px"
      rounded="full"
      cursor="copy"
      justify="center"
      align="center"
      pointerEvents="all"
      visibility={isHidden ? "hidden" : "visible"}
      {...props}
    >
      <Flex
        boxSize="20px"
        justify="center"
        align="center"
        bg={bg}
        rounded="full"
      >
        <Flex
          boxSize="13px"
          rounded="full"
          borderWidth="3.5px"
          shadow={`sm`}
          borderColor={
            previewingEdge &&
            "eventId" in previewingEdge.from &&
            previewingEdge.from.eventId === source.eventId
              ? connectedColor
              : color
          }
        />
      </Flex>
    </Flex>
  );
};
