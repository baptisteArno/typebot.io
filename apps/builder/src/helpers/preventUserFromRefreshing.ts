export const preventUserFromRefreshing = (e: BeforeUnloadEvent) => {
  e.preventDefault();
  e.returnValue = "";
};
