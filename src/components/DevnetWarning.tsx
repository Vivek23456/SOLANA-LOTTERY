import { FC } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const DevnetWarning: FC = () => {
  return (
    <Alert className="border-destructive/50 bg-destructive/10 mb-6">
      <AlertTriangle className="h-4 w-4 text-destructive" />
      <AlertDescription className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs">DEVNET</Badge>
            <span className="font-medium text-destructive">Test Environment Active</span>
          </div>
          <p className="text-sm text-muted-foreground">
            This lottery is running on Solana <strong>Devnet</strong>. No real SOL is involved. 
            All transactions are for testing purposes only.
          </p>
          <a 
            href="https://docs.solana.com/clusters#devnet" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
          >
            Learn about Devnet <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </AlertDescription>
    </Alert>
  );
};