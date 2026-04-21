import { useCallback } from 'react';
<<<<<<< HEAD
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to safely interact with the Electron API. In a web/browser environment,
 * window.electronAPI is undefined — calls become no-ops and return null.
 */
export function useElectron() {
  const { toast } = useToast();
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

  const safeCall = useCallback(
    async <T,>(label: string, fn: () => Promise<T>): Promise<T | null> => {
      if (!isElectron) {
        toast({
          title: 'Desktop only',
          description: `${label} is only available in the desktop app.`,
          variant: 'destructive',
        });
        return null;
      }
      try {
        return await fn();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        toast({ title: `${label} failed`, description: message, variant: 'destructive' });
        return null;
      }
    },
    [isElectron, toast]
  );

  return { isElectron, safeCall };
}

export default useElectron;
=======

export function useElectron() {
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

  const safeCall = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T | null> => {
    if (!isElectron) {
      console.warn(`${operationName} is only available in the desktop app`);
      return null;
    }

    try {
      return await operation();
    } catch (error) {
      console.error(`Failed to ${operationName.toLowerCase()}:`, error);
      return null;
    }
  }, [isElectron]);

  return { isElectron, safeCall };
}
>>>>>>> a45e102 (DS)
