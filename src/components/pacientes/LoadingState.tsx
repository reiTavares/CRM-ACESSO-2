import React from 'react';
import { Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';

export const LoadingState: React.FC = () => {
  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-background items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Carregando dados...</p>
      </div>
    </AppShell>
  );
};
