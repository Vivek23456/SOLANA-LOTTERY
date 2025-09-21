import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Coins, Users, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  totalLotteries: number;
  totalPrizePool: number;
  totalPlayers: number;
  activeDraws: number;
}

export const StatsCards: FC<StatsCardsProps> = ({
  totalLotteries,
  totalPrizePool,
  totalPlayers,
  activeDraws,
}) => {
  const stats = [
    {
      title: 'Total Lotteries',
      value: totalLotteries.toString(),
      icon: Trophy,
      color: 'text-accent',
    },
    {
      title: 'Total Prize Pool',
      value: `${totalPrizePool.toFixed(2)} SOL`,
      icon: Coins,
      color: 'text-primary',
    },
    {
      title: 'Total Players',
      value: totalPlayers.toString(),
      icon: Users,
      color: 'text-secondary-foreground',
    },
    {
      title: 'Active Draws',
      value: activeDraws.toString(),
      icon: TrendingUp,
      color: 'text-green-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card 
          key={stat.title}
          className="gradient-card border-primary/20 shadow-glow hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};