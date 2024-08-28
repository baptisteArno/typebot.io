import { PaymentInputBlock, Variable } from '@typebot.io/schemas';
export declare const createPaymentIntentQuery: ({ apiHost, isPreview, inputOptions, variables, }: {
    inputOptions: PaymentInputBlock["options"];
    apiHost: string;
    variables: Variable[];
    isPreview: boolean;
}) => Promise<{
    data?: {
        clientSecret: string;
        publicKey: string;
        amountLabel: string;
    } | undefined;
    error?: Error;
    response?: Response;
}>;
//# sourceMappingURL=createPaymentIntentQuery.d.ts.map