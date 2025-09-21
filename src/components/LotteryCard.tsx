import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Trophy, Coins } from 'lucide-react';
import { LotteryAccount, formatSOL, timestampToDate } from '@/lib/solana';
import { PublicKey } from '@solana/web3.js';
interface LotteryCardProps {
  lottery: LotteryAccount & {
    publicKey: PublicKey;
  };
  onBuyTicket: (lottery: LotteryAccount & {
    publicKey: PublicKey;
  }) => void;
  onDrawWinner: (lottery: LotteryAccount & {
    publicKey: PublicKey;
  }) => void;
  isOwner: boolean;
  userWallet?: PublicKey;
}
export const LotteryCard: FC<LotteryCardProps> = ({
  lottery,
  onBuyTicket,
  onDrawWinner,
  isOwner,
  userWallet
}) => {
  const closeDate = timestampToDate(lottery.closeTimestamp);
  const isExpired = closeDate < new Date();
  const canDraw = isExpired && lottery.tickets.length > 0 && !lottery.isDrawn;
  const ticketsSold = lottery.tickets.length;
  const progress = ticketsSold / lottery.maxTickets * 100;
  const prizePool = lottery.ticketPrice.toNumber() * ticketsSold;
  const userHasTicket = userWallet && lottery.tickets.some(ticket => ticket.equals(userWallet));
  const getStatusBadge = () => {
    if (lottery.isDrawn) {
      return <Badge className="gradient-winner text-background -bottom-0.5 bg-zinc-950">Winner Drawn</Badge>;
    }
    if (isExpired) {
      return <Badge variant="destructive">Closed</Badge>;
    }
    if (ticketsSold >= lottery.maxTickets) {
      return <Badge variant="secondary">Sold Out</Badge>;
    }
    return <Badge className="bg-primary text-primary-foreground">Active</Badge>;
  };
  return <Card className="gradient-card border-primary/20 shadow-glow hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        {/* Pool Image */}
        <div className="w-full h-48 rounded-lg overflow-hidden mb-4">
          <img src={lottery.poolImage} alt={lottery.poolName} className="w-full h-full object-cover" onError={e => {
          e.currentTarget.src = 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=400&h=300&fit=crop&crop=center';
        }} />
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold gradient-primary bg-clip-text text-slate-50">
              {lottery.poolName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              #{lottery.publicKey.toString().slice(0, 8)}...
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Prize Pool */}
        <div className="text-center p-4 rounded-lg border border-primary/20 bg-slate-50">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-6 h-6 text-accent" />
            <span className="text-2xl font-bold gradient-winner bg-clip-text text-slate-950">
              {formatSOL(prizePool)} SOL
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Prize Pool</p>
        </div>

        {/* Ticket Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Coins className="w-4 h-4 text-accent bg-gray-950" />
              <span className="font-semibold">{formatSOL(lottery.ticketPrice)} SOL</span>
            </div>
            <p className="text-xs text-muted-foreground">Per Ticket</p>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-4 h-4 text-accent bg-gray-950" />
              <span className="font-semibold">{ticketsSold}/{lottery.maxTickets}</span>
            </div>
            <p className="text-xs text-muted-foreground">Tickets Sold</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div className="gradient-primary h-2 rounded-full transition-all duration-500" style={{
            width: `${progress}%`
          }} />
          </div>
        </div>

        {/* Time Remaining */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {isExpired ? <span className="text-destructive">Closed</span> : <span>Closes: {closeDate.toLocaleDateString()} {closeDate.toLocaleTimeString()}</span>}
        </div>

        {userHasTicket && <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-center">
            <p className="text-sm font-medium text-gray-950">🎫 You have a ticket!</p>
          </div>}

        {/* Winner Info */}
        {lottery.isDrawn && lottery.winner && <div className="p-4 rounded-lg gradient-winner text-background text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 bg-gray-950" />
              <span className="font-bold text-slate-950">Winner!</span>
            </div>
            <p className="text-sm font-mono text-gray-950">
              {lottery.winner.toString().slice(0, 8)}...{lottery.winner.toString().slice(-8)}
            </p>
            <p className="text-sm font-bold mt-1 text-gray-950">
              Won {formatSOL(lottery.winnerAmount)} SOL
            </p>
          </div>}

        {/* Action Buttons */}
        <div className="space-y-2">
          {!lottery.isDrawn && !isExpired && ticketsSold < lottery.maxTickets && <Button variant="lottery" className="w-full" onClick={() => onBuyTicket(lottery)}>
              Buy Ticket for {formatSOL(lottery.ticketPrice)} SOL
            </Button>}

          {isOwner && canDraw && <Button variant="winner" className="w-full" onClick={() => onDrawWinner(lottery)}>
              Draw Winner 🎯
            </Button>}
        </div>
      </CardContent>
    </Card>;
};