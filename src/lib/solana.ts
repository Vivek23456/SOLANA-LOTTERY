import { 
  Connection, 
  PublicKey, 
  clusterApiUrl, 
  SystemProgram, 
  Transaction, 
  TransactionInstruction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  AccountInfo,
  Keypair
} from '@solana/web3.js';
import { Program, AnchorProvider, web3, utils, BN } from '@project-serum/anchor';

// Using System Program for real account operations
export const LOTTERY_PROGRAM_ID = SystemProgram.programId;

// Seeds for account generation
export const SEED_CONFIG = 'lottery-config';
export const SEED_LOTTERY = 'lottery';
export const SEED_ESCROW = 'lottery-escrow';

// Connection - using devnet for development  
export const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Helper function to get lottery account PDA
export const getLotteryPDA = (owner: PublicKey, lotteryId: string) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_LOTTERY), owner.toBuffer(), Buffer.from(lotteryId)],
    SystemProgram.programId
  );
};

// Helper function to get escrow account PDA  
export const getEscrowPDA = (lotteryAccount: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_ESCROW), lotteryAccount.toBuffer()],
    SystemProgram.programId
  );
};

// Types matching your Rust structs
export interface LotteryConfig {
  authority: PublicKey;
  feeBps: number;
  feeReceiver: PublicKey;
  oracle: PublicKey | null;
}

export interface LotteryAccount {
  owner: PublicKey;
  ticketPrice: BN;
  maxTickets: number;
  tickets: PublicKey[];
  bump: number;
  isActive: boolean;
  isDrawn: boolean;
  closeTimestamp: BN;
  winner: PublicKey | null;
  winnerAmount: BN;
  poolName: string;
  poolImage: string;
}

// Helper to convert timestamp to Date
export const timestampToDate = (timestamp: BN): Date => {
  return new Date(timestamp.toNumber() * 1000);
};

// Helper to convert Date to timestamp
export const dateToTimestamp = (date: Date): BN => {
  return new BN(Math.floor(date.getTime() / 1000));
};

// Helper to format SOL amount
export const formatSOL = (lamports: BN | number): string => {
  const amount = typeof lamports === 'number' ? lamports : lamports.toNumber();
  return (amount / web3.LAMPORTS_PER_SOL).toFixed(4);
};

// Helper to convert SOL to lamports
export const solToLamports = (sol: number): BN => {
  return new BN(sol * web3.LAMPORTS_PER_SOL);
};

// Generate unique lottery ID
export const generateLotteryId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Helper function to create memo instruction for transaction transparency
const createMemoInstruction = (memo: string): TransactionInstruction => {
  const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
  
  return new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memo, 'utf8'),
  });
};

// Serializable lottery data for on-chain storage
export interface SerializableLotteryData {
  owner: string;
  ticketPrice: string;
  maxTickets: number;
  tickets: string[];
  bump: number;
  isActive: boolean;
  isDrawn: boolean;
  closeTimestamp: string;
  winner: string | null;
  winnerAmount: string;
  poolName: string;
  poolImage: string;
}

// Serialize lottery data for on-chain storage
export const serializeLotteryData = (data: SerializableLotteryData): Buffer => {
  const jsonStr = JSON.stringify(data);
  return Buffer.from(jsonStr, 'utf8');
};

// Deserialize lottery data from on-chain storage
export const deserializeLotteryData = (buffer: Buffer): LotteryAccount => {
  const jsonStr = buffer.toString('utf8');
  const data = JSON.parse(jsonStr);
  
  return {
    ...data,
    owner: new PublicKey(data.owner),
    ticketPrice: new BN(data.ticketPrice),
    closeTimestamp: new BN(data.closeTimestamp),
    winner: data.winner ? new PublicKey(data.winner) : null,
    winnerAmount: new BN(data.winnerAmount),
    tickets: data.tickets.map((t: string) => new PublicKey(t))
  };
};

// Create a new lottery account on-chain
export const createLotteryAccount = async (
  owner: PublicKey,
  params: {
    ticketPrice: number;
    maxTickets: number;
    closeDate: Date;
    poolName: string;
    poolImage: string;
  },
  wallet: { sendTransaction: (transaction: any, connection: any) => Promise<string> }
): Promise<{ lotteryAccount: PublicKey; signature: string }> => {
  const lotteryId = generateLotteryId();
  const [lotteryAccount, bump] = getLotteryPDA(owner, lotteryId);
  const [escrowAccount] = getEscrowPDA(lotteryAccount);

  // Create lottery data
  const lotteryData: SerializableLotteryData = {
    owner: owner.toString(),
    ticketPrice: solToLamports(params.ticketPrice).toString(),
    maxTickets: params.maxTickets,
    tickets: [],
    bump,
    isActive: true,
    isDrawn: false,
    closeTimestamp: dateToTimestamp(params.closeDate).toString(),
    winner: null,
    winnerAmount: new BN(0).toString(),
    poolName: params.poolName,
    poolImage: params.poolImage,
  };

  const serializedData = serializeLotteryData(lotteryData);
  const space = serializedData.length + 1000; // Extra space for tickets
  const rentExemptLamports = await connection.getMinimumBalanceForRentExemption(space);

  // Create descriptive memo for wallet transparency
  const memoText = `Create Lottery: ${params.poolName} | Ticket: ${params.ticketPrice} SOL | Max: ${params.maxTickets} tickets | DEVNET TEST`;
  
  const transaction = new Transaction();
  
  // Add memo for transparency
  transaction.add(createMemoInstruction(memoText));
  
  // Create lottery account
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: owner,
      newAccountPubkey: lotteryAccount,
      lamports: rentExemptLamports,
      space,
      programId: SystemProgram.programId,
    })
  );

  // Create escrow account for holding lottery funds
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: owner,
      newAccountPubkey: escrowAccount,
      lamports: await connection.getMinimumBalanceForRentExemption(0),
      space: 0,
      programId: SystemProgram.programId,
    })
  );

  const signature = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature, 'confirmed');

  // Store lottery data
  const dataTransaction = new Transaction();
  // Note: In a real implementation, you'd use a custom program to store data
  // For now, we simulate by creating the account successfully
  
  return { lotteryAccount, signature };
};

// Buy a ticket for a lottery
export const buyLotteryTicket = async (
  buyer: PublicKey,
  lotteryAccount: PublicKey,
  ticketPrice: BN,
  wallet: { sendTransaction: (transaction: any, connection: any) => Promise<string> }
): Promise<string> => {
  const [escrowAccount] = getEscrowPDA(lotteryAccount);

  // Create descriptive memo for wallet transparency
  const memoText = `Buy Lottery Ticket: ${(ticketPrice.toNumber() / LAMPORTS_PER_SOL).toFixed(4)} SOL | DEVNET TEST`;
  
  const transaction = new Transaction();
  
  // Add memo for transparency
  transaction.add(createMemoInstruction(memoText));
  
  // Transfer SOL to escrow account
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: buyer,
      toPubkey: escrowAccount,
      lamports: ticketPrice.toNumber(),
    })
  );

  const signature = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature, 'confirmed');

  return signature;
};

// Draw winner using verifiable randomness
export const drawLotteryWinner = async (
  lottery: LotteryAccount & { publicKey: PublicKey },
  wallet: { sendTransaction: (transaction: any, connection: any) => Promise<string> }
): Promise<{ winner: PublicKey; signature: string; winnerAmount: BN }> => {
  if (lottery.tickets.length === 0) {
    throw new Error('No tickets available for drawing');
  }

  // Use recent blockhash for verifiable randomness
  const recentBlockhash = await connection.getLatestBlockhash();
  const randomSeed = recentBlockhash.blockhash;
  
  // Convert blockhash to number for deterministic selection
  const hashBuffer = Buffer.from(randomSeed, 'base64');
  const randomValue = hashBuffer.readUInt32BE(0);
  const winnerIndex = randomValue % lottery.tickets.length;
  const winner = lottery.tickets[winnerIndex];

  // Calculate prize (5% fee)
  const totalPrize = lottery.ticketPrice.toNumber() * lottery.tickets.length;
  const feeAmount = Math.floor(totalPrize * 0.05);
  const winnerAmount = new BN(totalPrize - feeAmount);

  const [escrowAccount] = getEscrowPDA(lottery.publicKey);
  
  // Create descriptive memo for wallet transparency
  const memoText = `Draw Lottery Winner: ${(winnerAmount.toNumber() / LAMPORTS_PER_SOL).toFixed(4)} SOL to winner | DEVNET TEST`;
  
  const transaction = new Transaction();
  
  // Add memo for transparency
  transaction.add(createMemoInstruction(memoText));
  
  // Transfer prize to winner
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: escrowAccount,
      toPubkey: winner,
      lamports: winnerAmount.toNumber(),
    })
  );

  const signature = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature, 'confirmed');

  return { winner, signature, winnerAmount };
};

// Fetch all lottery accounts (simplified implementation)
export const fetchLotteryAccounts = async (): Promise<(LotteryAccount & { publicKey: PublicKey })[]> => {
  // In a real implementation, you would fetch all program accounts
  // For now, return empty array as we'll store lotteries locally
  return [];
};

// Check if account exists and has data
export const checkAccountExists = async (publicKey: PublicKey): Promise<boolean> => {
  try {
    const accountInfo = await connection.getAccountInfo(publicKey);
    return accountInfo !== null;
  } catch {
    return false;
  }
};