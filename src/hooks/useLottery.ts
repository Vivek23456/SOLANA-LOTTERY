import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import { 
  LotteryAccount, 
  formatSOL, 
  createLotteryAccount,
  buyLotteryTicket,
  drawLotteryWinner,
  fetchLotteryAccounts,
  solToLamports,
  dateToTimestamp
} from '@/lib/solana';
import { useToast } from '@/hooks/use-toast';

// Demo mode flag - set to false to use real blockchain
const DEMO_MODE = false;

// Mock data for development - replace with actual Solana program integration
const mockLotteries: (LotteryAccount & { publicKey: PublicKey })[] = [
  {
    publicKey: new PublicKey('So11111111111111111111111111111111111111112'),
    owner: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    ticketPrice: { toNumber: () => 100000000 } as any, // 0.1 SOL
    maxTickets: 100,
    tickets: [
      new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
      new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    ],
    bump: 254,
    isActive: true,
    isDrawn: false,
    closeTimestamp: { toNumber: () => Date.now() / 1000 + 86400 } as any, // 1 day from now
    winner: null,
    winnerAmount: { toNumber: () => 0 } as any,
    poolName: 'Golden Jackpot Pool',
    poolImage: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=400&h=300&fit=crop&crop=center',
  },
  {
    publicKey: new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'),
    owner: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
    ticketPrice: { toNumber: () => 50000000 } as any, // 0.05 SOL
    maxTickets: 50,
    tickets: Array.from({ length: 45 }, (_, i) => 
      new PublicKey('So11111111111111111111111111111111111111112')
    ),
    bump: 253,
    isActive: true,
    isDrawn: false,
    closeTimestamp: { toNumber: () => Date.now() / 1000 + 3600 } as any, // 1 hour from now
    winner: null,
    winnerAmount: { toNumber: () => 0 } as any,
    poolName: 'Mega Prize Arena',
    poolImage: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&h=300&fit=crop&crop=center',
  },
  {
    publicKey: new PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'),
    owner: new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'),
    ticketPrice: { toNumber: () => 200000000 } as any, // 0.2 SOL
    maxTickets: 20,
    tickets: Array.from({ length: 20 }, (_, i) => 
      new PublicKey('So11111111111111111111111111111111111111112')
    ),
    bump: 252,
    isActive: false,
    isDrawn: true,
    closeTimestamp: { toNumber: () => Date.now() / 1000 - 3600 } as any, // 1 hour ago
    winner: new PublicKey('SysvarC1ock11111111111111111111111111111111'),
    winnerAmount: { toNumber: () => 3800000000 } as any, // 3.8 SOL (after fees)
    poolName: 'Diamond Elite Raffle',
    poolImage: 'https://images.unsplash.com/photo-1514064019862-23e2a332a6a6?w=400&h=300&fit=crop&crop=center',
  },
];

export const useLottery = () => {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { toast } = useToast();
  const [lotteries, setLotteries] = useState<(LotteryAccount & { publicKey: PublicKey })[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate mock transaction signature for demo purposes
  const generateMockSignature = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 88; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Simulate blockchain delay
  const simulateBlockchainDelay = () => new Promise(resolve => 
    setTimeout(resolve, 2000 + Math.random() * 2000)
  );

  // Load lotteries on mount
  useEffect(() => {
    loadLotteries();
  }, []);

  const loadLotteries = async () => {
    setLoading(true);
    try {
      if (DEMO_MODE) {
        // Demo mode - use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLotteries(mockLotteries);
      } else {
        // Real mode - fetch from blockchain
        const lotteryAccounts = await fetchLotteryAccounts();
        setLotteries(lotteryAccounts);
      }
    } catch (error) {
      console.error('Error loading lotteries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load lotteries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createLottery = async (params: {
    ticketPrice: number;
    maxTickets: number;
    closeDate: Date;
    poolName: string;
    poolImage: string;
  }) => {
    if (!connected || !publicKey || !sendTransaction) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to create a lottery',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating lottery with params:', params);
      
      if (DEMO_MODE) {
        // Demo mode - simulate without real blockchain transaction
        await simulateBlockchainDelay();
        
        const mockSignature = generateMockSignature();
        const lotteryId = Math.random().toString(36).substring(2, 15);
        const mockPDA = new PublicKey('So11111111111111111111111111111111111111112');
        
        const newLottery = {
          publicKey: mockPDA,
          owner: publicKey,
          ticketPrice: new BN(params.ticketPrice * 1e9),
          maxTickets: params.maxTickets,
          tickets: [],
          bump: 254,
          isActive: true,
          isDrawn: false,
          closeTimestamp: dateToTimestamp(params.closeDate),
          winner: null,
          winnerAmount: new BN(0),
          poolName: params.poolName,
          poolImage: params.poolImage,
        };

        setLotteries(prevLotteries => [newLottery, ...prevLotteries]);
        
        toast({
          title: 'Demo Mode - Lottery Created! 🎯',
          description: `Lottery simulated successfully! Mock signature: ${mockSignature.slice(0, 8)}...`,
        });
        
        console.log('Demo lottery created with mock signature:', mockSignature);
      } else {
        // Real blockchain implementation
        const { lotteryAccount, signature } = await createLotteryAccount(
          publicKey,
          params,
          { sendTransaction }
        );

        const newLottery: LotteryAccount & { publicKey: PublicKey } = {
          publicKey: lotteryAccount,
          owner: publicKey,
          ticketPrice: solToLamports(params.ticketPrice),
          maxTickets: params.maxTickets,
          tickets: [],
          bump: 254, // This would come from PDA generation
          isActive: true,
          isDrawn: false,
          closeTimestamp: dateToTimestamp(params.closeDate),
          winner: null,
          winnerAmount: new BN(0),
          poolName: params.poolName,
          poolImage: params.poolImage,
        };

        setLotteries(prevLotteries => [newLottery, ...prevLotteries]);
        
        toast({
          title: 'Lottery Created! 🎯',
          description: `Lottery created successfully! Signature: ${signature.slice(0, 8)}...`,
        });
        
        console.log('Real lottery created with signature:', signature);
      }
    } catch (error) {
      console.error('Error creating lottery:', error);
      
      // Handle wallet rejection specifically
      if (error instanceof Error && error.message.includes('User rejected')) {
        toast({
          title: 'Transaction cancelled',
          description: 'You cancelled the transaction in your wallet.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Failed to create lottery',
          description: error instanceof Error ? error.message : 'Please check your wallet connection and try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const buyTicket = async (lottery: LotteryAccount & { publicKey: PublicKey }) => {
    if (!connected || !publicKey || !sendTransaction) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to buy a ticket',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Buying ticket for lottery:', lottery.publicKey.toString());
      
      if (DEMO_MODE) {
        // Demo mode - simulate ticket purchase
        await simulateBlockchainDelay();
        
        const mockSignature = generateMockSignature();
        
        setLotteries(prevLotteries => 
          prevLotteries.map(l => 
            l.publicKey.equals(lottery.publicKey) 
              ? { ...l, tickets: [...l.tickets, publicKey] }
              : l
          )
        );
        
        toast({
          title: 'Demo Mode - Ticket Purchased! 🎫',
          description: `Ticket simulated for ${formatSOL(lottery.ticketPrice)} SOL! Mock signature: ${mockSignature.slice(0, 8)}...`,
        });
        
        console.log('Demo ticket purchased with mock signature:', mockSignature);
      } else {
        // Real blockchain implementation
        const signature = await buyLotteryTicket(
          publicKey,
          lottery.publicKey,
          lottery.ticketPrice,
          { sendTransaction }
        );

        // Update local state
        setLotteries(prevLotteries => 
          prevLotteries.map(l => 
            l.publicKey.equals(lottery.publicKey) 
              ? { ...l, tickets: [...l.tickets, publicKey] }
              : l
          )
        );
        
        toast({
          title: 'Ticket Purchased! 🎫',
          description: `Ticket purchased for ${formatSOL(lottery.ticketPrice)} SOL! Signature: ${signature.slice(0, 8)}...`,
        });
        
        console.log('Real ticket purchased with signature:', signature);
      }
    } catch (error) {
      console.error('Error buying ticket:', error);
      
      // Handle wallet rejection specifically
      if (error instanceof Error && error.message.includes('User rejected')) {
        toast({
          title: 'Transaction cancelled',
          description: 'You cancelled the transaction in your wallet.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Failed to buy ticket',
          description: error instanceof Error ? error.message : 'Please check your wallet connection and try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const drawWinner = async (lottery: LotteryAccount & { publicKey: PublicKey }) => {
    if (!connected || !publicKey || !sendTransaction) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to draw winner',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Drawing winner for lottery:', lottery.publicKey.toString());
      
      if (DEMO_MODE) {
        // Demo mode - simulate winner drawing
        await simulateBlockchainDelay();
        
        const mockSignature = generateMockSignature();
        
        if (lottery.tickets.length === 0) {
          toast({
            title: 'No tickets available',
            description: 'Cannot draw winner - no tickets have been purchased',
            variant: 'destructive',
          });
          return;
        }
        
        const randomIndex = Math.floor(Math.random() * lottery.tickets.length);
        const winner = lottery.tickets[randomIndex];
        const totalPrize = lottery.ticketPrice.toNumber() * lottery.tickets.length;
        const feeAmount = Math.floor(totalPrize * 0.05);
        const winnerAmount = new BN(totalPrize - feeAmount);
        
        setLotteries(prevLotteries => 
          prevLotteries.map(l => 
            l.publicKey.equals(lottery.publicKey) 
              ? { 
                  ...l, 
                  isActive: false, 
                  isDrawn: true,
                  winner,
                  winnerAmount
                }
              : l
          )
        );
        
        toast({
          title: 'Demo Mode - Winner Drawn! 🏆',
          description: `Winner selected! Prize: ${formatSOL(winnerAmount)} SOL. Mock signature: ${mockSignature.slice(0, 8)}...`,
        });
        
        console.log('Demo winner drawn with mock signature:', mockSignature);
      } else {
        // Real blockchain implementation with verifiable randomness
        const { winner, signature, winnerAmount } = await drawLotteryWinner(
          lottery,
          { sendTransaction }
        );

        // Update local state
        setLotteries(prevLotteries => 
          prevLotteries.map(l => 
            l.publicKey.equals(lottery.publicKey) 
              ? { 
                  ...l, 
                  isActive: false, 
                  isDrawn: true,
                  winner,
                  winnerAmount
                }
              : l
          )
        );
        
        toast({
          title: 'Winner Drawn! 🏆',
          description: `Winner selected! Prize: ${formatSOL(winnerAmount)} SOL. Signature: ${signature.slice(0, 8)}...`,
        });
        
        console.log('Real winner drawn with signature:', signature);
      }
    } catch (error) {
      console.error('Error drawing winner:', error);
      
      // Handle wallet rejection specifically
      if (error instanceof Error && error.message.includes('User rejected')) {
        toast({
          title: 'Transaction cancelled',
          description: 'You cancelled the transaction in your wallet.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Failed to draw winner',
          description: error instanceof Error ? error.message : 'Please check your wallet connection and try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    lotteries,
    loading,
    createLottery,
    buyTicket,
    drawWinner,
    loadLotteries,
    isDemoMode: DEMO_MODE,
  };
};