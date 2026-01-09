export const refreshSessionUser = async () => {
  await fetch("/api/auth/session?update");
  const event = new Event("visibilitychange");
  document.dispatchEvent(event);
};
