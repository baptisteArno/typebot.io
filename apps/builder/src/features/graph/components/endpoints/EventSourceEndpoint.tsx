import {
  type BoxProps,
  Flex,
  useColorModeValue,
  useEventListener,
} from "@chakra-ui/react";
import type { TEventSource } from "@typebot.io/typebot/schemas/edge";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const color = useColorModeValue("blue.200", "blue.100");
  const connectedColor = useColorModeValue("blue.300", "blue.200");
  const bg = useColorModeValue("gray.100", "gray.700");
  const { setConnectingIds, previewingEdge, graphPosition } = useGraph();
  const { setSourceEndpointYOffset, deleteSourceEndpointYOffset } =
    useEndpoints();
  const [eventTransformProp, setEventTransformProp] = useState<string>();
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const mutationObserver = new MutationObserver((entries) => {
      setEventTransformProp((entries[0].target as HTMLElement).style.transform);
    });
    const groupElement = document.getElementById(`event-${source.eventId}`);
    if (!groupElement) return;
    mutationObserver.observe(groupElement, {
      attributes: true,
      attributeFilter: ["style"],
    });
    return () => {
      mutationObserver.disconnect();
    };
  }, [source.eventId]);

  useEffect(() => {
    const y = ref.current
      ? Number(
          (
            (ref.current?.getBoundingClientRect().y +
              (endpointHeight * graphPosition.scale) / 2 -
              graphPosition.y) /
            graphPosition.scale
          ).toFixed(2),
        )
      : undefined;
    if (y === undefined) return;
    setSourceEndpointYOffset?.({
      id: source.eventId,
      y,
    });
  }, [
    graphPosition.scale,
    graphPosition.y,
    setSourceEndpointYOffset,
    source.eventId,
    eventTransformProp,
  ]);

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
