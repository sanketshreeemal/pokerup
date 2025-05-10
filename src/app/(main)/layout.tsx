// This layout provides the base HTML structure and includes the AppLayout component
// It is the outermost layer that each page in the (main) section inherits from
// Provides the sidebar navigation across all pages in the (main) section

import AppLayout from '@/components/ui/AppLayout';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
} 