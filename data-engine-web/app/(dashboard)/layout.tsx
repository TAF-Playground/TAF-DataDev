import { EditorProvider } from '@/contexts/EditorContext';
import { MetricsProvider } from '@/contexts/MetricsContext';
import { DatabaseProvider } from '@/contexts/DatabaseContext';
import { QueryResultProvider } from '@/contexts/QueryResultContext';
import { TableStructureProvider } from '@/contexts/TableStructureContext';

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
            <TableStructureProvider>
              {children}
            </TableStructureProvider>
          </QueryResultProvider>
        </DatabaseProvider>
      </MetricsProvider>
    </EditorProvider>
  );
}
