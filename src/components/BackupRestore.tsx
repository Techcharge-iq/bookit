import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useElectron } from '@/hooks/useElectron';
import { Database, Download, Upload, Info } from 'lucide-react';

export default function BackupRestore() {
  const { selectedCompanyId, companies } = useApp();
  const [dbPath, setDbPath] = useState<string>('');
  const { toast } = useToast();
  const { safeCall, isElectron } = useElectron();

  const companyName = companies.find((c) => c.id === selectedCompanyId)?.name || 'default';

  useEffect(() => {
    if (!isElectron) return;
    safeCall('Get database path', () => window.electronAPI!.getDbPath()).then((path) => {
      if (path) setDbPath(path);
    });
  }, [isElectron]);

  const handleBackup = async () => {
    const result = await safeCall('Backup', () =>
      window.electronAPI!.showSaveDialog({
        title: 'Save Database Backup',
        defaultPath: `${companyName.replace(/\s+/g, '-')}-backup-${new Date().toISOString().split('T')[0]}.db`,
        filters: [{ name: 'Database Files', extensions: ['db'] }],
      }),
    );
    if (!result || (result as any).canceled) return;
    const filePath = (result as any).filePath;
    const saved = await safeCall('Backup save', () => window.electronAPI!.backup(filePath));
    if (saved !== null) {
      toast({ title: 'Backup saved!', description: `Backed up to: ${filePath}` });
    }
  };

  const handleRestore = async () => {
    const result = await safeCall('Restore', () =>
      window.electronAPI!.showOpenDialog({
        title: 'Select Database Backup',
        filters: [{ name: 'Database Files', extensions: ['db'] }],
        properties: ['openFile'],
      }),
    );
    if (!result || (result as any).canceled || !(result as any).filePaths?.length) return;
    const restored = await safeCall('Restore apply', () =>
      window.electronAPI!.restore((result as any).filePaths[0]),
    );
    if (restored !== null) {
      toast({ title: 'Restore complete!', description: 'Please restart the app for changes to take effect.' });
    }
  };

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          Data Backup & Restore
        </CardTitle>
        <CardDescription className="text-xs">
          Backup your data or restore from a previous backup
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleBackup} variant="outline" size="sm" className="flex-1 gap-2">
            <Download className="h-4 w-4" />Create Backup
          </Button>
          <Button onClick={handleRestore} variant="outline" size="sm" className="flex-1 gap-2">
            <Upload className="h-4 w-4" />Restore Backup
          </Button>
        </div>

        <div className="rounded-lg bg-muted/50 p-3 space-y-2">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-medium">Database Location</p>
              <p className="text-xs text-muted-foreground break-all">
                {!isElectron ? 'Not available in browser mode' : dbPath || 'Loading…'}
              </p>
              <p className="text-xs text-muted-foreground">
                Your data is stored in a single file. Copy this file to backup manually or use the buttons above.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
