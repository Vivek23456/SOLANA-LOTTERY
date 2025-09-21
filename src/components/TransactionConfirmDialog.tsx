import { FC } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Coins, Users, Calendar, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TransactionDetails {
  type: 'create_lottery' | 'buy_ticket' | 'draw_winner';
  amount?: number;
  description: string;
  details: Record<string, any>;
}

interface TransactionConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transaction: TransactionDetails | null;
  loading?: boolean;
}

export const TransactionConfirmDialog: FC<TransactionConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  loading = false,
}) => {
  if (!transaction) return null;

  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'create_lottery':
        return <Coins className="w-5 h-5 text-primary" />;
      case 'buy_ticket':
        return <Users className="w-5 h-5 text-secondary" />;
      case 'draw_winner':
        return <Calendar className="w-5 h-5 text-accent" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getTransactionTitle = () => {
    switch (transaction.type) {
      case 'create_lottery':
        return 'Create New Lottery';
      case 'buy_ticket':
        return 'Purchase Lottery Ticket';
      case 'draw_winner':
        return 'Draw Lottery Winner';
      default:
        return 'Confirm Transaction';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {getTransactionIcon()}
            {getTransactionTitle()}
          </DialogTitle>
        </DialogHeader>

        {/* Devnet Warning */}
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-sm">
            <strong>Devnet Transaction:</strong> This is a test transaction on Solana Devnet. 
            No real SOL will be transferred.
          </AlertDescription>
        </Alert>

        {/* Transaction Details */}
        <Card className="bg-muted/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Transaction Type:</span>
              <Badge variant="secondary">{transaction.description}</Badge>
            </div>

            {transaction.amount && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Amount:</span>
                <span className="font-mono text-sm font-bold">
                  {transaction.amount.toFixed(4)} SOL
                </span>
              </div>
            )}

            {/* Transaction-specific details */}
            {transaction.type === 'create_lottery' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pool Name:</span>
                  <span className="text-sm">{transaction.details.poolName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Ticket Price:</span>
                  <span className="text-sm font-mono">{transaction.details.ticketPrice} SOL</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Max Tickets:</span>
                  <span className="text-sm">{transaction.details.maxTickets}</span>
                </div>
              </>
            )}

            {transaction.type === 'buy_ticket' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Lottery:</span>
                  <span className="text-sm">{transaction.details.poolName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Your Ticket #:</span>
                  <span className="text-sm font-mono">#{transaction.details.ticketNumber}</span>
                </div>
              </>
            )}

            {transaction.type === 'draw_winner' && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Prize Pool:</span>
                <span className="text-sm font-mono">{transaction.details.prizePool} SOL</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Information */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• This transaction is executed on Solana Devnet</p>
          <p>• Transaction will include descriptive memo for transparency</p>
          <p>• Your wallet will show the exact operation being performed</p>
          <p>• You can cancel this transaction in your wallet if needed</p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : 'Confirm Transaction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};