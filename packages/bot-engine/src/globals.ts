export const globals = {
  emailSendingCount: 0,
  prevHash: undefined as string | undefined,
};

export const resetGlobals = () => {
  globals.emailSendingCount = 0;
  globals.prevHash = undefined;
};
