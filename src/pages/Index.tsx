import { useState, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletProvider } from '@/components/WalletProvider';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { LotteryCard } from '@/components/LotteryCard';
import { CreateLotteryModal } from '@/components/CreateLotteryModal';
import { DevnetWarning } from '@/components/DevnetWarning';
import { useLottery } from '@/hooks/useLottery';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { formatSOL } from '@/lib/solana';
const LotteryDashboard = () => {
  const {
    publicKey
  } = useWallet();
  const {
    lotteries,
    loading,
    createLottery,
    buyTicket,
    drawWinner,
    isDemoMode
  } = useLottery();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    const totalLotteries = lotteries.length;
    const totalPrizePool = lotteries.reduce((sum, lottery) => {
      return sum + lottery.ticketPrice.toNumber() * lottery.tickets.length / 1e9; // Convert to SOL
    }, 0);
    const totalPlayers = new Set(lotteries.flatMap(lottery => lottery.tickets.map(ticket => ticket.toString()))).size;
    const activeDraws = lotteries.filter(lottery => lottery.isActive && !lottery.isDrawn).length;
    return {
      totalLotteries,
      totalPrizePool,
      totalPlayers,
      activeDraws
    };
  }, [lotteries]);
  const handleBuyTicket = async (lottery: any) => {
    await buyTicket(lottery);
  };
  const handleDrawWinner = async (lottery: any) => {
    await drawWinner(lottery);
  };
  const activeLotteries = lotteries.filter(lottery => lottery.isActive && !lottery.isDrawn);
  const completedLotteries = lotteries.filter(lottery => lottery.isDrawn);
  if (loading && lotteries.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading lotteries...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <Header onCreateLottery={() => setIsCreateModalOpen(true)} isDemoMode={isDemoMode} />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <DevnetWarning />
        
        {/* Hero Section */}
        <div className="text-center space-y-4 py-12">
          <div className="animate-float">
            <img src="/src/assets/solana-logo.png" alt="Solana Logo" className="w-16 h-16 mx-auto mb-4" />
          </div>
          <h1 className="text-5xl font-bold gradient-primary bg-clip-text text-gray-50">
            Solana Lottery
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the thrill of decentralized lottery on Solana. 
            Transparent, fair, and lightning fast.
          </p>
          {!publicKey && <div className="pt-6">
              <p className="text-muted-foreground mb-4">Connect your wallet to get started</p>
            </div>}
        </div>

        {/* Stats */}
        <StatsCards {...stats} />

        {/* Active Lotteries */}
        {activeLotteries.length > 0 && <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Active Lotteries</h2>
              <Button variant="lottery" onClick={() => setIsCreateModalOpen(true)} disabled={!publicKey}>
                Create New
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeLotteries.map(lottery => <LotteryCard key={lottery.publicKey.toString()} lottery={lottery} onBuyTicket={handleBuyTicket} onDrawWinner={handleDrawWinner} isOwner={publicKey?.equals(lottery.owner) || false} userWallet={publicKey} />)}
            </div>
          </section>}

        {/* Recent Winners */}
        {completedLotteries.length > 0 && <section className="space-y-6">
            <h2 className="text-3xl font-bold">Recent Winners</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedLotteries.slice(0, 6).map(lottery => <LotteryCard key={lottery.publicKey.toString()} lottery={lottery} onBuyTicket={handleBuyTicket} onDrawWinner={handleDrawWinner} isOwner={publicKey?.equals(lottery.owner) || false} userWallet={publicKey} />)}
            </div>
          </section>}

        {/* Empty State */}
        {lotteries.length === 0 && !loading && <div className="text-center py-16 space-y-6">
            <div className="animate-float">
              <Sparkles className="w-24 h-24 mx-auto text-muted-foreground/50" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">No Lotteries Yet</h3>
              <p className="text-muted-foreground">Be the first to create a lottery!</p>
            </div>
            <Button variant="lottery" size="lg" onClick={() => setIsCreateModalOpen(true)} disabled={!publicKey}>
              Create First Lottery
            </Button>
          </div>}
      </main>

      <CreateLotteryModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreateLottery={createLottery} />
    </div>;
};
const Index = () => {
  return <WalletProvider>
      <LotteryDashboard />
    </WalletProvider>;
};
export default Index;