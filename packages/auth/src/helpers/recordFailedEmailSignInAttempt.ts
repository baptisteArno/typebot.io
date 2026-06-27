const EMAIL_SIGN_IN_FAILED_ATTEMPTS_PREFIX = "email-sign-in-failed-attempts:";

export const INITIAL_EMAIL_SIGN_IN_FAILED_ATTEMPTS = `${EMAIL_SIGN_IN_FAILED_ATTEMPTS_PREFIX}0`;

export const EMAIL_SIGN_IN_VERIFICATION_TOKEN_VALUE = "email-sign-in";

const MAX_EMAIL_SIGN_IN_FAILED_ATTEMPTS = 5;

type VerificationTokenWhere = {
  identifier: string;
  expires?: { gt: Date };
  failedAttempts?: { lt?: number; gte?: number };
  OR: (
    | { value: string | null }
    | { value: { startsWith: typeof EMAIL_SIGN_IN_FAILED_ATTEMPTS_PREFIX } }
  )[];
};

type VerificationTokenStore = {
  verificationToken: {
    updateMany: (args: {
      where: VerificationTokenWhere;
      data: { failedAttempts: { increment: number } };
    }) => PromiseLike<{ count: number }>;
    deleteMany: (args: {
      where: VerificationTokenWhere;
    }) => PromiseLike<{ count: number }>;
  };
};

export const recordFailedEmailSignInAttempt = async (
  p: VerificationTokenStore,
  identifier: string,
) => {
  if (!isEmailIdentifier(identifier)) return;

  const { count } = await p.verificationToken.updateMany({
    where: {
      ...getEmailSignInVerificationTokenWhere(identifier),
      expires: { gt: new Date() },
      failedAttempts: { lt: MAX_EMAIL_SIGN_IN_FAILED_ATTEMPTS },
    },
    data: { failedAttempts: { increment: 1 } },
  });

  if (count === 0) return;

  await p.verificationToken.deleteMany({
    where: {
      ...getEmailSignInVerificationTokenWhere(identifier),
      failedAttempts: { gte: MAX_EMAIL_SIGN_IN_FAILED_ATTEMPTS },
    },
  });
};

const getEmailSignInVerificationTokenWhere = (
  identifier: string,
): VerificationTokenWhere => ({
  identifier,
  OR: [
    { value: null },
    { value: EMAIL_SIGN_IN_VERIFICATION_TOKEN_VALUE },
    { value: { startsWith: EMAIL_SIGN_IN_FAILED_ATTEMPTS_PREFIX } },
  ],
});

const isEmailIdentifier = (identifier: string) => {
  const parts = identifier.split("@");
  return parts.length === 2 && parts.every(Boolean);
};
