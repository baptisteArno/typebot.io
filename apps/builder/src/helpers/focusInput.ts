type Props = {
  at: number;
  input?: HTMLInputElement | HTMLTextAreaElement | null;
};

export const focusInput = ({ at, input }: Props) => {
  if (!input) return;
  input.focus();
  setTimeout(() => {
    input.selectionStart = input.selectionEnd = at;
  }, 100);
};
