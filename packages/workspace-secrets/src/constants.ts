export const workspaceSecretReferencePrefix = "$secrets.";

export const workspaceSecretReferenceRegex = /\{\{\$secrets\.([A-Z0-9_]+)\}\}/g;

export const workspaceSecretNameRegex = /^[A-Z][A-Z0-9_]{0,63}$/;

export const workspaceSecretMaxValueLength = 8192;
