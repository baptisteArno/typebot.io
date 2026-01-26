import "@/assets/styles/routerProgressBar.css";
import "@/assets/styles/plate.css";
import "@/assets/styles/resultsTable.css";
import "@/assets/styles/custom.css";
import "@/assets/styles/globals.css";

export default function renderRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body text-gray-12 bg-gray-2 dark:bg-gray-1 antialiased">
        {children}
      </body>
    </html>
  );
}
