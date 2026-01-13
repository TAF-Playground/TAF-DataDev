import { EditorProvider } from '@/contexts/EditorContext';
import { MetricsProvider } from '@/contexts/MetricsContext';
import { DatabaseProvider } from '@/contexts/DatabaseContext';
import { QueryResultProvider } from '@/contexts/QueryResultContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EditorProvider>
      <MetricsProvider>
        <DatabaseProvider>
          <QueryResultProvider>
            {children}
          </QueryResultProvider>
        </DatabaseProvider>
      </MetricsProvider>
    </EditorProvider>
  );
}
