export type {};

declare module "solid-js" {
  namespace JSX {
    interface CustomEvents {
      click: MouseEvent;
      pointerdown: PointerEvent;
    }

    interface SvgSVGAttributes<T> extends SVGAttributes<T> {
      part?: string;
    }
  }
}
