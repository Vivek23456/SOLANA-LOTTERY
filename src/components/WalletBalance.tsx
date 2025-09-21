import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { connection } from '@/lib/solana';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, RefreshCw } from 'lucide-react';

export const WalletBalance = () => {
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    setLoading(true);
    try {
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [publicKey]);

  if (!publicKey) return null;

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Wallet Balance</span>
          </div>
          <button
            onClick={fetchBalance}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="mt-2">
          {balance !== null ? (
            <span className="text-2xl font-bold">
              {balance.toFixed(4)} SOL
            </span>
          ) : (
            <span className="text-muted-foreground">Loading...</span>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
        </div>
      </CardContent>
    </Card>
  );
};