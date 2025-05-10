// Root layout (providers, base HTML structure)
// This is the main layout component that wraps the entire application
// It provides the base HTML structure and includes providers for state management, toast notifications, and other global services
// Outermost layer that each page in the app inherits from

import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
} 