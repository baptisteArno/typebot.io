export const dialogClassNames = {
  backdrop:
    "fixed inset-0 w-full bg-gray-12/50 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out overflow-auto",
  positioner: "flex justify-center fixed top-0 w-full py-12 max-h-full",
  content:
    "relative bg-gray-1 p-6 rounded-xl w-full max-w-xl overflow-auto data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-5 data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-5 data-[state=closed]:fade-out",
  title: "text-2xl",
};
