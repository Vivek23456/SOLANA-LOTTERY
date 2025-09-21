import { FC, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Users, Coins, Clock } from 'lucide-react';
import { solToLamports } from '@/lib/solana';
import { DevnetWarning } from '@/components/DevnetWarning';

interface CreateLotteryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLottery: (params: {
    ticketPrice: number;
    maxTickets: number;
    closeDate: Date;
    poolName: string;
    poolImage: string;
  }) => void;
}

export const CreateLotteryModal: FC<CreateLotteryModalProps> = ({
  isOpen,
  onClose,
  onCreateLottery,
}) => {
  const [ticketPrice, setTicketPrice] = useState('0.1');
  const [maxTickets, setMaxTickets] = useState('100');
  const [closeDate, setCloseDate] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [poolName, setPoolName] = useState('');
  const [poolImage, setPoolImage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const price = parseFloat(ticketPrice);
    const tickets = parseInt(maxTickets);
    const date = new Date(`${closeDate}T${closeTime}`);
    
    if (price <= 0 || tickets <= 0 || date <= new Date()) {
      return;
    }

    onCreateLottery({
      ticketPrice: price,
      maxTickets: tickets,
      closeDate: date,
      poolName: poolName || `Lottery Pool #${Date.now()}`,
      poolImage: poolImage || 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=400&h=300&fit=crop&crop=center',
    });
    
    // Reset form
    setTicketPrice('0.1');
    setMaxTickets('100');
    setCloseDate('');
    setCloseTime('');
    setPoolName('');
    setPoolImage('');
    onClose();
  };

  // Calculate potential prize pool
  const potentialPrize = parseFloat(ticketPrice) * parseInt(maxTickets || '0');

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto gradient-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
            Create New Lottery
          </DialogTitle>
        </DialogHeader>

        <DevnetWarning />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pool Name */}
          <div className="space-y-2">
            <Label htmlFor="poolName" className="text-sm font-medium flex items-center gap-2">
              🎯 Pool Name
            </Label>
            <Input
              id="poolName"
              type="text"
              placeholder="e.g., Golden Jackpot, Mega Prize Pool"
              value={poolName}
              onChange={(e) => setPoolName(e.target.value)}
              className="bg-secondary/50 border-primary/20"
            />
            <p className="text-xs text-muted-foreground">Leave empty for auto-generated name</p>
          </div>

          {/* Pool Image */}
          <div className="space-y-2">
            <Label htmlFor="poolImage" className="text-sm font-medium flex items-center gap-2">
              🖼️ Pool Image URL
            </Label>
            <Input
              id="poolImage"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={poolImage}
              onChange={(e) => setPoolImage(e.target.value)}
              className="bg-secondary/50 border-primary/20"
            />
            <p className="text-xs text-muted-foreground">Leave empty for default image</p>
          </div>

          {/* Prize Pool Preview */}
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins className="w-6 h-6 text-accent" />
                <span className="text-2xl font-bold gradient-winner bg-clip-text text-transparent">
                  {potentialPrize.toFixed(4)} SOL
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Maximum Prize Pool</p>
            </CardContent>
          </Card>

          {/* Ticket Price */}
          <div className="space-y-2">
            <Label htmlFor="ticketPrice" className="text-sm font-medium flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Ticket Price (SOL)
            </Label>
            <Input
              id="ticketPrice"
              type="number"
              step="0.01"
              min="0.01"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(e.target.value)}
              className="bg-secondary/50 border-primary/20"
              required
            />
          </div>

          {/* Max Tickets */}
          <div className="space-y-2">
            <Label htmlFor="maxTickets" className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Maximum Tickets
            </Label>
            <Input
              id="maxTickets"
              type="number"
              min="1"
              max="1000"
              value={maxTickets}
              onChange={(e) => setMaxTickets(e.target.value)}
              className="bg-secondary/50 border-primary/20"
              required
            />
          </div>

          {/* Close Date */}
          <div className="space-y-2">
            <Label htmlFor="closeDate" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Close Date
            </Label>
            <Input
              id="closeDate"
              type="date"
              min={minDate}
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
              className="bg-secondary/50 border-primary/20"
              required
            />
          </div>

          {/* Close Time */}
          <div className="space-y-2">
            <Label htmlFor="closeTime" className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Close Time
            </Label>
            <Input
              id="closeTime"
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="bg-secondary/50 border-primary/20"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="lottery" className="flex-1">
              Create Lottery 🎲
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};