type Props = {
  url: string;
  onLinkClick: () => void;
};

export const PopupBlockedToast = ({ url, onLinkClick }: Props) => {
  return (
    <div
      className="w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow flex flex-col gap-2"
      role="alert"
    >
      <span className="mb-1 text-sm font-semibold text-gray-900">
        Popup blocked
      </span>
      <div className="mb-2 text-sm font-normal">
        The bot wants to open a new tab but it was blocked by your broswer. It
        needs a manual approval.
      </div>
      <a
        href={url}
        target="_blank"
        className="py-1 px-4 justify-center text-sm font-semibold rounded-md text-white focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 typebot-button"
        rel="noreferrer"
        onClick={onLinkClick}
      >
        Continue in new tab
      </a>
    </div>
  );
};
