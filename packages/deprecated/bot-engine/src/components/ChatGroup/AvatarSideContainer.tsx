import {
  type ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { CSSTransition } from "react-transition-group";
import { ResizeObserver } from "resize-observer";
import { Avatar } from "../avatars/Avatar";

type Props = { hostAvatarSrc?: string; keepShowing: boolean };

export const AvatarSideContainer = forwardRef(function AvatarSideContainer(
  { hostAvatarSrc, keepShowing }: Props,
  ref: ForwardedRef<unknown>,
) {
  const [show, setShow] = useState(false);
  const [avatarTopOffset, setAvatarTopOffset] = useState(0);

  const refreshTopOffset = () => {
    if (!scrollingSideGroupRef.current || !avatarContainer.current) return;
    const { height } = scrollingSideGroupRef.current.getBoundingClientRect();
    const { height: avatarHeight } =
      avatarContainer.current.getBoundingClientRect();
    setAvatarTopOffset(height - avatarHeight);
  };
  const scrollingSideGroupRef = useRef<HTMLDivElement>(null);
  const avatarContainer = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({
    refreshTopOffset,
  }));

  useEffect(() => {
    if (!document) return;
    setShow(true);
    const resizeObserver = new ResizeObserver(refreshTopOffset);
    resizeObserver.observe(document.body);
    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="flex w-6 xs:w-10 mr-2 mb-2 flex-shrink-0 items-center relative typebot-avatar-container "
      ref={scrollingSideGroupRef}
    >
      <CSSTransition
        classNames="bubble"
        timeout={500}
        in={show && keepShowing}
        unmountOnExit
      >
        <div
          className="absolute w-6 xs:w-10 h-6 xs:h-10 mb-4 xs:mb-2 flex items-center top-0"
          ref={avatarContainer}
          style={{
            top: `${avatarTopOffset}px`,
            transition: "top 350ms ease-out, opacity 500ms",
          }}
        >
          <Avatar avatarSrc={hostAvatarSrc} />
        </div>
      </CSSTransition>
    </div>
  );
});
