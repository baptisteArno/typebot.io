import { Dialog } from "@ariakit/react/dialog";

export const ScrollableDialog = ({
  children,
  open,
  onClose,
}: { open: boolean; onClose: () => void; children: React.ReactNode }) => (
  <Dialog
    open={open}
    onClose={onClose}
    backdrop={false}
    className="flex m-auto flex-col gap-4 rounded-xl bg-gray-1 p-4 opacity-0 transition-all scale-95 data-[enter]:opacity-100 data-[enter]:scale-100 h-fit max-h-none inset-auto max-w-xl border shadow-lg"
    render={(props) => (
      <div
        hidden={!open}
        data-enter={open}
        className="fixed inset-0 z-50 h-full w-full bg-black/10 backdrop-blur-0 overflow-auto opacity-0 transition-all duration-150 data-[enter]:opacity-100 data-[enter]:backdrop-blur-sm px-4 p-12"
      >
        <div {...props} />
      </div>
    )}
  >
    {children}
  </Dialog>
);
