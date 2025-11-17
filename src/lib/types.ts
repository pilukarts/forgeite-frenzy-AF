import type { LucideIcon } from 'lucide-react';

export type LeagueName = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster';

// Battle Pass Types
export type RewardType = 'points' | 'auron' | 'title';

export interface BattlePassReward {
  type: RewardType;
  amount?: number; // for points and auron
  name?: string; // for title
  icon: LucideIcon;
}

export interface BattlePassLevel {
  level: number;
  freeReward: BattlePassReward | null;
  premiumReward: BattlePassReward | null;
}

export interface BattlePass {
  seasonId: string;
  premiumCostInAuron: number;
  levels: BattlePassLevel[];
  [key: number]: BattlePassLevel; // Index signature for numeric indexing
}

export interface PlayerProfile {
  id: string;
  name: string;
  commanderSex: 'male' | 'female';
  country?: string;
  avatarUrl: string; // URL for the full-body image.
  portraitUrl: string; // URL for the portrait/face image.
  points: number;
  auron: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  rankTitle: string;
  rankInsignia?: string;
  currentSeasonId: string;
  seasonProgress: { [seasonId: string]: number };
  upgrades: { [upgradeId: string]: number };
  muleDrones: number;
  coreVoiceProtocol: 'male' | 'female' | 'synthetic';
  isWalletConnected: boolean;
  walletAddress?: string;
  arkHangarFullyUpgraded: boolean;
  lastLoginTimestamp: number | null;
  activeTapBonuses: ActiveTapBonus[];
  activeDailyQuests: DailyQuest[];
  lastDailyQuestRefresh: number; // Timestamp of the last daily quest refresh
  referralCode: string;
  referredByCode?: string; // Made optional to handle undefined values

  // Tap Limit System
  currentTaps: number;
  maxTaps: number;
  tapsAvailableAt: number; // Timestamp when taps will be refilled

  // Visual Tier Color
  currentTierColor: string; // Stores HSL string like "210 15% 75%"

  // League System
  league: LeagueName;

  // Battle Pass fields
  battlePassLevel: number;
  battlePassXp: number;
  xpToNextBattlePassLevel: number;
  hasPremiumPass: boolean;
  claimedBattlePassRewards: { [level: number]: ('free' | 'premium')[] };
  battlePassRewardsClaimed: { [level: number]: boolean }; // Changed to boolean map

  // Rewarded Ad
  lastRewardedAdTimestamp: number;
  
  // Telegram Integration
  isTelegramWalletConnected: boolean;

  // ALL MISSING PROPERTIES ADDED HERE
  // Game mechanics
  activeTapBonusMultiplier: number;
  tapsUsedToday: number;
  totalLogsTapped: number;
  totalTaps: number;
  totalCrits: number;
  longestTapCombo: number;
  longestTapStreak: number;
  tapMax: number;
  
  // Commander and Ark
  selectedCommanderId: string | null;
  arkUpgrades: { [upgradeId: string]: number };
  
  // Wallet and connections
  connectedWallets: string[];
  totalTelegramWalletConnections: number;
  
  // Statistics and tracking
  totalTapRegenPurchases: number;
  battlePassPremiumPurchased: boolean;
  totalAdsWatched: number;
  totalArksLaunched: number;
}

export interface Season {
  id: string;
  chapter: number;
  title:string;
  description: string;
  objectiveResourceName: string;
  objectiveResourceIcon?: LucideIcon | string;
  coreBriefingObjective: string;
  unlocksCore: boolean;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  effectDescription: (level: number) => string;
  maxLevel?: number;
  icon?: LucideIcon;
}

export interface ArkUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  visualStage: number;
  isPurchased: boolean;
  baseCost?: number; // Optional for compatibility
  costMultiplier?: number; // Optional for compatibility
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName:string;
  country?: string;
  score: number;
  playerLeague: LeagueName; // Added for league display
  avatarUrl?: string;
  lastSeen?: Date | null;
}

export interface CoreMessage {
  id: string; // Added for uniqueness
  title?: string; // Added for compatibility
  type: 'briefing' | 'progress_update' | 'lore_snippet' | 'advice' | 'system_alert' | 'question' | 'answer' | 'response' | 'progress'; // Extended with missing types
  content: string;
  timestamp: number;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  costInAuron: number;
  bonusEffect: {
    durationTaps: number;
    multiplier: number;
  };
  icon?: LucideIcon;
  // Additional properties for compatibility (ALIASES)
  costAuron?: number; // Alias for costInAuron
  type?: string; // Type of bonus
  multiplier?: number; // Bonus multiplier
  duration?: number; // Duration in taps
}

export interface ActiveTapBonus {
  id: string; // Unique ID for this active bonus instance
  marketItemId: string; // ID of the MarketplaceItem this bonus came from
  name: string; // Name of the bonus (from MarketplaceItem)
  remainingTaps: number;
  bonusMultiplier: number;
  originalDurationTaps: number; // To display progress like X/Y taps
  // Additional properties for compatibility
  type?: string;
  multiplier?: number;
  duration?: number;
  expiryTime?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderCommanderSex?: 'male' | 'female';
  content: string;
  timestamp: number;
  isPlayer: boolean;
}

// Daily Quests System Types - ALL QUEST TYPES INCLUDED
export type QuestType = 'taps' | 'points_earned' | 'login' | 'spend_auron' | 'purchase_upgrade' | 'earn_points' | 'tap_log' | 'reach_level' | 'build_ark' | 'upgrade_ark' | 'connect_wallet';

export interface QuestReward {
  points?: number;
  auron?: number;
  // items?: string[]; // For future item rewards
}

export interface DailyQuest {
  id: string; // Unique ID for this instance of the quest (e.g., templateId-timestamp)
  templateId: string; // ID from the DAILY_QUESTS_POOL
  title: string;
  description: string;
  type: QuestType;
  target: number;
  progress: number;
  reward: QuestReward;
  isCompleted: boolean; // Calculated: progress >= target
  isClaimed: boolean;
  completed?: boolean; // Alias for isCompleted
  icon?: LucideIcon | string; // Extended to support both types
}

// This is for the pool of available quests
export interface DailyQuestTemplate {
  templateId: string;
  title: string;
  description: string;
  type: QuestType;
  target: number;
  reward: QuestReward;
  icon?: LucideIcon | string; // Extended to support both types
}

// League System
export interface LeagueTier {
    name: LeagueName;
    minPoints: number;
    icon: LucideIcon;
    colorClass: string; // Tailwind color class for the icon/text
}

// Level Map Stages
export interface LevelStage {
    name: string;
    startLevel: number;
    endLevel: number;
    colors: {
        primary: string; // HSL string for the border/text
        fill: string; // HSL string for the hex fill
    };
    backgroundImageUrl: string;
    aiHint: string;
}

export interface SelectableAvatar {
  id?: string; // Added for compatibility
  portraitUrl: string;
  fullBodyUrl: string;
  sex: 'male' | 'female';
  hint: string;
  imageUrl?: string; // Alternative property name for compatibility
}

// Commander interface for selection
export interface Commander {
  id: string;
  name: string;
  description: string;
  sex: 'male' | 'female';
  portraitUrl: string;
  avatarUrl: string;
  abilities?: string[];
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

// Toast interface (for compatibility)
export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

// Function types for toast (for compatibility)
export interface ToastFunction {
  (options: { title?: string; description?: string; variant?: 'default' | 'destructive' | 'success' }): void;
}

// Game Context Type
export interface GameContextType {
  // Profile management
  playerProfile: PlayerProfile;
  updatePlayerProfile: (updates: Partial<PlayerProfile>) => void;
  
  // Tap mechanics
  handleTap: (elementId: string) => void;
  performTap: (baseDamage: number, elementId: string, hasActiveBonuses: boolean) => { damage: number; isCrit: boolean };
  
  // Quest management
  updateQuestProgress: (questId: string, progress: number) => void;
  claimQuestReward: (questId: string) => void;
  
  // Battle Pass
  claimBattlePassReward: (level: number, rewardType: 'free' | 'premium') => void;
  
  // Commander selection
  selectedCommanderId: string | null;
  setSelectedCommanderId: (commanderId: string | null) => void;
  
  // Wallet operations
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;
  
  // Ad rewards
  watchRewardedAd: () => void;
  
  // Audio controls
  toggleMusic: () => void;
  isMusicPlaying: boolean;
  
  // Game actions
  performAction: (actionType: string, amount: number) => void;
  
  // Statistics
  totalTaps: number;
  totalCrits: number;
  totalTapsUsed: number;
  longestTapCombo: number;
  longestTapStreak: number;
}

// Context parameters for AI functions
export interface PlayerContext {
  points: number;
  level: number;
  rankTitle: string;
  season: string;
  seasonObjective: string;
  playerLevel?: number; // Alias for level
}

export interface AIQuestion {
  question: string;
  playerContext: PlayerContext;
}

export interface AIProgressContext {
  playerProgress: number;
  seasonObjective: string;
  playerLevel: number;
  availableUpgrades: string;
}

// Context for briefing function
export interface BriefingContext {
  season: string;
  playerProgress: string;
}

export interface AIAdviceContext {
  playerLevel: number;
  availableUpgrades: string;
}

// Type guards and utilities
export const isDailyQuest = (quest: DailyQuest): boolean => {
  return typeof quest === 'object' && 'isCompleted' in quest;
};

export const getQuestType = (template: DailyQuestTemplate): QuestType => {
  return template.type;
};

// Commander Selection Component (Props interface)
export interface CommanderSelectionProps {
  selectedCommanderId?: string | null;
  onCommanderSelect: (commanderId: string) => void;
}

// Commander Portrait Component (Props interface)
export interface CommanderPortraitProps {
  playerProfile: PlayerProfile;
}