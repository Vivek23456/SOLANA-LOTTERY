import { useState, useEffect } from 'react';
import { connection } from '@/lib/solana';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

interface TransactionStatusProps {
  signature: string;
  onConfirmed?: () => void;
}

export const TransactionStatus = ({ signature, onConfirmed }: TransactionStatusProps) => {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await connection.confirmTransaction(signature, 'confirmed');
        if (result.value.err) {
          setStatus('failed');
        } else {
          setStatus('confirmed');
          onConfirmed?.();
        }
      } catch (error) {
        setStatus('failed');
      }
    };

    if (signature) {
      checkStatus();
    }
  }, [signature, onConfirmed]);

  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Confirming...
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge variant="default" className="flex items-center gap-2 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            Confirmed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="flex items-center gap-2">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Transaction:</span>
        <code className="text-xs bg-background px-2 py-1 rounded">
          {signature.slice(0, 8)}...{signature.slice(-8)}
        </code>
      </div>
      <div className="flex items-center gap-2">
        {getStatusBadge()}
        <a
          href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
};