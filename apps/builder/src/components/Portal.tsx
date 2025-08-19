// Pasted from https://github.com/radix-ui/primitives/blob/main/packages/react/portal/src/portal.tsx
import * as React from "react";
import ReactDOM from "react-dom";

/* -------------------------------------------------------------------------------------------------
 * Portal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = "Portal";

type PortalElement = React.ComponentRef<"div">;
type PrimitiveDivProps = React.ComponentPropsWithoutRef<"div">;
interface PortalProps extends PrimitiveDivProps {
  /**
   * An optional container where the portaled content should be appended.
   */
  container?: Element | DocumentFragment | null;
}

const Portal = React.forwardRef<PortalElement, PortalProps>(
  (props, forwardedRef) => {
    const { container: containerProp, ...portalProps } = props;
    const [mounted, setMounted] = React.useState(false);
    React.useLayoutEffect(() => setMounted(true), []);
    const container = containerProp || (mounted && globalThis?.document?.body);
    return container
      ? ReactDOM.createPortal(
          <div {...portalProps} ref={forwardedRef} />,
          container,
        )
      : null;
  },
);

Portal.displayName = PORTAL_NAME;

/* -----------------------------------------------------------------------------------------------*/

export { Portal };
export type { PortalProps };
