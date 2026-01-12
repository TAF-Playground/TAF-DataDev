import { EditorProvider } from '@/contexts/EditorContext';
import { MetricsProvider } from '@/contexts/MetricsContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EditorProvider>
      <MetricsProvider>
        {children}
      </MetricsProvider>
    </EditorProvider>
  );
}
