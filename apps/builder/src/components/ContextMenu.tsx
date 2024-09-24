import {
  Menu,
  MenuButton,
  type MenuButtonProps,
  type MenuProps,
  Portal,
  type PortalProps,
  useEventListener,
} from "@chakra-ui/react";
import type { MutableRefObject } from "react";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

export interface ContextMenuProps<T extends HTMLElement> {
  onOpen?: () => void;
  renderMenu: ({ onClose }: { onClose: () => void }) => JSX.Element | null;
  children: (
    ref: MutableRefObject<T | null>,
    isOpened: boolean,
  ) => JSX.Element | null;
  menuProps?: MenuProps;
  portalProps?: PortalProps;
  menuButtonProps?: MenuButtonProps;
  isDisabled?: boolean;
}

export function ContextMenu<T extends HTMLElement = HTMLElement>(
  props: ContextMenuProps<T>,
) {
  const [isOpened, setIsOpened] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isDeferredOpen, setIsDeferredOpen] = useState(false);
  const [position, setPosition] = useState<[number, number]>([0, 0]);
  const targetRef = useRef<T>(null);

  useEffect(() => {
    if (isOpened) {
      setTimeout(() => {
        setIsRendered(true);
        setTimeout(() => {
          setIsDeferredOpen(true);
        });
      });
    } else {
      setIsDeferredOpen(false);
      const timeout = setTimeout(() => {
        setIsRendered(isOpened);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isOpened]);

  useEventListener(
    "contextmenu",
    (e) => {
      if (props.isDisabled) return;
      if (e.currentTarget === targetRef.current) {
        e.preventDefault();
        e.stopPropagation();
        props.onOpen?.();
        setIsOpened(true);
        setPosition([e.pageX, e.pageY]);
      } else {
        setIsOpened(false);
      }
    },
    targetRef.current,
  );

  const onCloseHandler = useCallback(() => {
    props.menuProps?.onClose?.();
    setIsOpened(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.menuProps?.onClose, setIsOpened]);

  return (
    <>
      {props.children(targetRef, isOpened)}
      {isRendered && (
        <Portal {...props.portalProps}>
          <Menu
            isOpen={isDeferredOpen}
            gutter={0}
            {...props.menuProps}
            onClose={onCloseHandler}
          >
            <MenuButton
              aria-hidden={true}
              w={1}
              h={1}
              style={{
                position: "absolute",
                left: position[0],
                top: position[1],
                cursor: "default",
              }}
              {...props.menuButtonProps}
            />
            {props.renderMenu({ onClose: onCloseHandler })}
          </Menu>
        </Portal>
      )}
    </>
  );
}
