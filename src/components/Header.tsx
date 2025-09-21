import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Badge } from '@/components/ui/badge';
import { WalletBalance } from '@/components/WalletBalance';
import { Button } from '@/components/ui/button';
import { Zap, ZapOff, Plus } from 'lucide-react';
import { SolanaLogo3D } from '@/components/SolanaLogo3D';

interface HeaderProps {
  onCreateLottery: () => void;
  isDemoMode?: boolean;
}

export const Header: FC<HeaderProps> = ({ onCreateLottery, isDemoMode = false }) => {
  const { connected } = useWallet();

  return (
    <header className="border-b border-primary/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <SolanaLogo3D />
            <div>
              <h1 className="text-2xl font-display font-bold gradient-primary bg-clip-text tracking-tight text-slate-50">
                LOTTERY
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground font-medium">Premium Prize Pools</p>
                <Badge variant={isDemoMode ? "secondary" : "default"} className="flex items-center gap-1 text-xs">
                  {isDemoMode ? (
                    <>
                      <ZapOff className="h-2 w-2" />
                      Demo
                    </>
                  ) : (
                    <>
                      <Zap className="h-2 w-2" />
                      Live
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {connected && <WalletBalance />}
            
            <Button variant="lottery" onClick={onCreateLottery} className="hidden sm:flex">
              <Plus className="w-4 h-4 mr-2" />
              Create Lottery
            </Button>
            
            <Button variant="lottery" onClick={onCreateLottery} size="icon" className="sm:hidden">
              <Plus className="w-4 h-4" />
            </Button>

            <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90 !h-10 !px-4 !rounded-md !font-medium !transition-all !duration-300 hover:!scale-105 !shadow-glow" />
          </div>
        </div>
      </div>
    </header>
  );
};