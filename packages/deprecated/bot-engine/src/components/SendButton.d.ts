import { SVGProps } from 'react';
type SendButtonProps = {
    label: string;
    isDisabled?: boolean;
    isLoading?: boolean;
    disableIcon?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;
export declare const SendButton: ({ label, isDisabled, isLoading, disableIcon, ...props }: SendButtonProps) => import("react/jsx-runtime").JSX.Element;
export declare const Spinner: (props: SVGProps<SVGSVGElement>) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SendButton.d.ts.map