import { AudioBubbleBlock } from '@typebot.io/schemas';
type Props = {
    url: NonNullable<AudioBubbleBlock['content']>['url'];
    onTransitionEnd: () => void;
};
export declare const AudioBubble: ({ url, onTransitionEnd }: Props) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AudioBubble.d.ts.map