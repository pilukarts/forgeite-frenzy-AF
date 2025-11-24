"use client";

import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import type { MarketplaceItem } from '@/lib/types';

// Types
export interface PlayerProfile {
  id: string;
  name: string;
  commanderId: string;
  commanderSex: 'male' | 'female';
  portraitUrl: string;
  level: number;
  rank: string;
  experience: number;
  experienceToNext: number;
  points: number;
  totalPoints: number;
  pointsPerTap: number;
  achievements: string[];
  isWalletConnected: boolean;
  isTelegramWalletConnected: boolean;
  walletAddress?: string;
  auron: number;
  currentTaps: number;
  maxTaps: number;
  tapsAvailableAt: number;
  upgrades: Record<string, number>;
  seasonProgress: Record<string, number>;
  activeDailyQuests: string[];
  activeTapBonuses: ActiveTapBonus[];
  battlePassLevel: number;
  battlePassXp: number;
  xpToNextBattlePassLevel: number;
  hasPremiumPass: boolean;
  claimedBattlePassRewards: Record<number, string[]>;
  currentTierColor: string;
  coreVoiceProtocol: string;
  referralCode: string;
}

export interface ActiveTapBonus {
  id: string;
  marketItemId: string;
  name: string;
  remainingTaps: number;
  bonusMultiplier: number;
  originalDurationTaps: number;
}

export interface Season {
  id: string;
  name: string;
  description: string;
  targetPoints: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  completed: boolean;
  isCompleted?: boolean;
  isClaimed: boolean;
  expiresAt: number;
  claimed?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  effect: string;
}

export interface ArkUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  isUnlocked: boolean;
}

export interface CoreMessage {
  id: string;
  type: 'briefing' | 'tip' | 'lore';
  message: string;
  timestamp: number;
}

export interface BattlePassReward {
  id: string;
  type: 'points' | 'auron' | 'cosmetic' | 'boost';
  amount: number;
  name: string;
}

export interface BattlePassLevel {
  level: number;
  freeReward: BattlePassReward;
  premiumReward: BattlePassReward;
}

export interface BattlePassData {
  currentLevel: number;
  currentXp: number;
  xpToNextLevel: number;
  levels: BattlePassLevel[];
  seasonName: string;
  seasonEndDate: number;
  premiumCostInAuron: number;
}

interface GameState {
  playerProfile: PlayerProfile | null;
  isLoading: boolean;
  isInitialSetupDone: boolean;
  currentSeason: Season;
  dailyQuests: DailyQuest[];
  upgrades: Upgrade[];
  arkUpgrades: ArkUpgrade[];
  coreMessages: CoreMessage[];
  isCoreUnlocked: boolean;
  isOpen: boolean;
  hasUnread: boolean;
  isMusicPlaying: boolean;
  commanderVisible: boolean;
  battlePassData: BattlePassData;
  marketplaceItems: MarketplaceItem[];
  rewardedAdCooldown: number;
  isWatchingAd: boolean;
  isTelegramEnv: boolean;
}

type GameAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INIT_PLAYER'; payload: PlayerProfile }
  | { type: 'UPDATE_PLAYER'; payload: Partial<PlayerProfile> }
  | { type: 'COMPLETE_SETUP' }
  | { type: 'ADD_POINTS'; payload: number }
  | { type: 'CONNECT_WALLET'; payload: string }
  | { type: 'CLAIM_QUEST'; payload: string }
  | { type: 'PURCHASE_UPGRADE'; payload: { upgradeId: string; cost: number } }
  | { type: 'PURCHASE_ARK_UPGRADE'; payload: string }
  | { type: 'ADD_CORE_MESSAGE'; payload: CoreMessage }
  | { type: 'SET_CORE_OPEN'; payload: boolean }
  | { type: 'SET_HAS_UNREAD'; payload: boolean }
  | { type: 'TOGGLE_MUSIC' }
  | { type: 'TOGGLE_COMMANDER' }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'REFRESH_QUESTS' }
  | { type: 'PURCHASE_PREMIUM_PASS' }
  | { type: 'CLAIM_BATTLE_PASS_REWARD'; payload: { level: number; track: 'free' | 'premium' } };

const DEFAULT_SEASON: Season = {
  id: 'season1',
  name: 'Ark Construction',
  description: 'Build the foundation of your StarForge Ark',
  targetPoints: 100000
};

const INITIAL_QUESTS: DailyQuest[] = [
  {
    id: 'daily_taps',
    title: 'Toca el Comandante',
    description: 'Toca al comandante 100 veces',
    progress: 0,
    target: 100,
    reward: 500,
    completed: false,
    isClaimed: false,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  },
  {
    id: 'daily_points',
    title: 'Acumula Recursos',
    description: 'Acumula 10,000 puntos totales',
    progress: 0,
    target: 10000,
    reward: 750,
    completed: false,
    isClaimed: false,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  },
  {
    id: 'daily_criticals',
    title: 'Golpes Críticos',
    description: 'Consigue 25 golpes críticos',
    progress: 0,
    target: 25,
    reward: 1000,
    completed: false,
    isClaimed: false,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  }
];

const DEFAULT_UPGRADES: Upgrade[] = [
  { id: 'tap_power', name: 'Tap Power', description: 'Increase points per tap', baseCost: 100, costMultiplier: 1.5, maxLevel: 50, effect: '+1 per tap' },
  { id: 'critical_chance', name: 'Critical Chance', description: 'Increase critical hit chance', baseCost: 250, costMultiplier: 1.8, maxLevel: 25, effect: '+2% crit chance' },
  { id: 'combo_bonus', name: 'Combo Bonus', description: 'Increase combo multiplier', baseCost: 500, costMultiplier: 2.0, maxLevel: 20, effect: '+5% combo bonus' },
  { id: 'passive_income', name: 'M.U.L.E. Drone', description: 'Earn points automatically', baseCost: 1000, costMultiplier: 2.5, maxLevel: 100, effect: '+0.5 pts/sec' }
];

const DEFAULT_ARK_UPGRADES: ArkUpgrade[] = [
  { id: 'hull', name: 'Hull Plating', description: 'Reinforce the ark hull', cost: 5000, isUnlocked: false },
  { id: 'engine', name: 'Quantum Engine', description: 'Install faster engines', cost: 10000, isUnlocked: false },
  { id: 'shield', name: 'Energy Shield', description: 'Add protective shields', cost: 25000, isUnlocked: false },
  { id: 'core', name: 'Fusion Core', description: 'Power the ark systems', cost: 50000, isUnlocked: false }
];

const DEFAULT_BATTLE_PASS_LEVELS: BattlePassLevel[] = [
  { level: 1, freeReward: { id: 'bp_1_f', type: 'points', amount: 100, name: '100 Points' }, premiumReward: { id: 'bp_1_p', type: 'auron', amount: 10, name: '10 Auron' } },
  { level: 2, freeReward: { id: 'bp_2_f', type: 'points', amount: 150, name: '150 Points' }, premiumReward: { id: 'bp_2_p', type: 'auron', amount: 15, name: '15 Auron' } },
  { level: 3, freeReward: { id: 'bp_3_f', type: 'points', amount: 200, name: '200 Points' }, premiumReward: { id: 'bp_3_p', type: 'boost', amount: 1, name: 'Tap Boost' } },
  { level: 4, freeReward: { id: 'bp_4_f', type: 'points', amount: 250, name: '250 Points' }, premiumReward: { id: 'bp_4_p', type: 'auron', amount: 20, name: '20 Auron' } },
  { level: 5, freeReward: { id: 'bp_5_f', type: 'auron', amount: 10, name: '10 Auron' }, premiumReward: { id: 'bp_5_p', type: 'cosmetic', amount: 1, name: 'Exclusive Skin' } },
];

const DEFAULT_BATTLE_PASS_DATA: BattlePassData = {
  currentLevel: 1,
  currentXp: 0,
  xpToNextLevel: 1000,
  levels: DEFAULT_BATTLE_PASS_LEVELS,
  seasonName: 'Season 1: Ark Construction',
  seasonEndDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
  premiumCostInAuron: 500
};

const initialState: GameState = {
  playerProfile: null,
  isLoading: true,
  isInitialSetupDone: false,
  currentSeason: DEFAULT_SEASON,
  dailyQuests: INITIAL_QUESTS,
  upgrades: DEFAULT_UPGRADES,
  arkUpgrades: DEFAULT_ARK_UPGRADES,
  coreMessages: [],
  isCoreUnlocked: false,
  isOpen: false,
  hasUnread: false,
  isMusicPlaying: false,
  commanderVisible: true,
  battlePassData: DEFAULT_BATTLE_PASS_DATA,
  marketplaceItems: [
    { id: 'boost_2x', name: '2x Tap Boost', description: 'Double your taps for 50 taps', costInAuron: 50, bonusEffect: { durationTaps: 50, multiplier: 2 } },
    { id: 'boost_3x', name: '3x Tap Boost', description: 'Triple your taps for 30 taps', costInAuron: 100, bonusEffect: { durationTaps: 30, multiplier: 3 } },
    { id: 'boost_5x', name: '5x Tap Boost', description: '5x your taps for 20 taps', costInAuron: 200, bonusEffect: { durationTaps: 20, multiplier: 5 } },
  ],
  rewardedAdCooldown: 0,
  isWatchingAd: false,
  isTelegramEnv: false
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'INIT_PLAYER':
      return {
        ...state,
        playerProfile: action.payload,
        isInitialSetupDone: true,
        isLoading: false
      };
    
    case 'UPDATE_PLAYER':
      if (!state.playerProfile) return state;
      return {
        ...state,
        playerProfile: { ...state.playerProfile, ...action.payload }
      };
    
    case 'COMPLETE_SETUP':
      return { ...state, isInitialSetupDone: true };
    
    case 'ADD_POINTS':
      if (!state.playerProfile) return state;
      return {
        ...state,
        playerProfile: {
          ...state.playerProfile,
          points: state.playerProfile.points + action.payload,
          totalPoints: state.playerProfile.totalPoints + action.payload
        }
      };
    
    case 'CONNECT_WALLET':
      if (!state.playerProfile) return state;
      return {
        ...state,
        playerProfile: {
          ...state.playerProfile,
          isWalletConnected: true,
          walletAddress: action.payload,
          auron: state.playerProfile.auron + 100 // Bonus for connecting
        }
      };
    
    case 'CLAIM_QUEST':
      const updatedQuests = state.dailyQuests.map(quest =>
        quest.id === action.payload ? { ...quest, claimed: true } : quest
      );
      const claimedQuest = state.dailyQuests.find(q => q.id === action.payload);
      const rewardPoints = claimedQuest?.reward || 0;
      return {
        ...state,
        dailyQuests: updatedQuests,
        playerProfile: state.playerProfile ? {
          ...state.playerProfile,
          points: state.playerProfile.points + rewardPoints
        } : null
      };
    
    case 'PURCHASE_UPGRADE':
      if (!state.playerProfile) return state;
      const currentLevel = state.playerProfile.upgrades[action.payload.upgradeId] || 0;
      return {
        ...state,
        playerProfile: {
          ...state.playerProfile,
          points: state.playerProfile.points - action.payload.cost,
          upgrades: {
            ...state.playerProfile.upgrades,
            [action.payload.upgradeId]: currentLevel + 1
          }
        }
      };
    
    case 'PURCHASE_ARK_UPGRADE':
      const arkUpgrade = state.arkUpgrades.find(u => u.id === action.payload);
      if (!arkUpgrade || !state.playerProfile) return state;
      return {
        ...state,
        playerProfile: {
          ...state.playerProfile,
          points: state.playerProfile.points - arkUpgrade.cost,
          upgrades: {
            ...state.playerProfile.upgrades,
            [action.payload]: 1
          }
        },
        arkUpgrades: state.arkUpgrades.map(u =>
          u.id === action.payload ? { ...u, isUnlocked: true } : u
        )
      };
    
    case 'ADD_CORE_MESSAGE':
      return {
        ...state,
        coreMessages: [...state.coreMessages, action.payload],
        hasUnread: true
      };
    
    case 'SET_CORE_OPEN':
      return { ...state, isOpen: action.payload };
    
    case 'SET_HAS_UNREAD':
      return { ...state, hasUnread: action.payload };
    
    case 'TOGGLE_MUSIC':
      return { ...state, isMusicPlaying: !state.isMusicPlaying };
    
    case 'TOGGLE_COMMANDER':
      return { ...state, commanderVisible: !state.commanderVisible };
    
    case 'RESET_GAME':
      localStorage.removeItem('forgenite_frenzy_save');
      return { ...initialState, isLoading: false };
    
    case 'LOAD_GAME':
      return { ...action.payload, isLoading: false };
    
    case 'REFRESH_QUESTS':
      const now = Date.now();
      const refreshedQuests = state.dailyQuests.map(quest => {
        if (quest.expiresAt < now) {
          return {
            ...quest,
            progress: 0,
            completed: false,
            claimed: false,
            expiresAt: now + 24 * 60 * 60 * 1000
          };
        }
        return quest;
      });
      return { ...state, dailyQuests: refreshedQuests };
    
    case 'PURCHASE_PREMIUM_PASS':
      if (!state.playerProfile || state.playerProfile.auron < 500) return state;
      return {
        ...state,
        playerProfile: {
          ...state.playerProfile,
          hasPremiumPass: true,
          auron: state.playerProfile.auron - 500
        }
      };
    
    case 'CLAIM_BATTLE_PASS_REWARD':
      if (!state.playerProfile) return state;
      const { level, track } = action.payload;
      const currentClaimed = state.playerProfile.claimedBattlePassRewards[level] || [];
      return {
        ...state,
        playerProfile: {
          ...state.playerProfile,
          claimedBattlePassRewards: {
            ...state.playerProfile.claimedBattlePassRewards,
            [level]: [...currentClaimed, track]
          }
        }
      };
    
    default:
      return state;
  }
}

interface GameContextValue {
  // State
  playerProfile: PlayerProfile | null;
  isLoading: boolean;
  isInitialSetupDone: boolean;
  currentSeason: Season;
  dailyQuests: DailyQuest[];
  upgrades: Upgrade[];
  arkUpgrades: ArkUpgrade[];
  coreMessages: CoreMessage[];
  isCoreUnlocked: boolean;
  battlePassData: BattlePassData;
  isOpen: boolean;
  hasUnread: boolean;
  isMusicPlaying: boolean;
  marketplaceItems: MarketplaceItem[];
  rewardedAdCooldown: number;
  isWatchingAd: boolean;
  isTelegramEnv: boolean;
  
  // Actions
  completeInitialSetup: (profile: PlayerProfile) => void;
  addPoints: (points: number) => void;
  connectWallet: (address: string) => void;
  claimQuestReward: (questId: string) => void;
  purchaseUpgrade: (upgradeId: string) => void;
  purchaseArkUpgrade: (upgradeId: string) => void;
  askCore: (question: string) => Promise<void>;
  setIsOpen: (isOpen: boolean) => void;
  setHasUnread: (hasUnread: boolean) => void;
  toggleMusic: () => void;
  toggleCommander: () => void;
  resetGame: () => void;
  updatePlayerProfile: (updates: Partial<PlayerProfile>) => void;
  refreshDailyQuestsIfNeeded: () => void;
  purchasePremiumPass: () => void;
  claimBattlePassReward: (level: number, track: 'free' | 'premium') => void;
  purchaseMarketplaceItem: (itemId: string) => void;
  setPlayerProfile: (profile: PlayerProfile | ((prev: PlayerProfile | null) => PlayerProfile | null)) => void;
  watchRewardedAd: () => void;
  connectTelegramWallet: () => void;
  purchaseWithTelegramWallet: (pkg: { amount: number; price: number }) => void;
  handleTap: (isLogoTap: boolean) => void;
  
  // Utility functions
  getUpgradeLevel: (upgradeId: string) => number;
  getUpgradeCost: (upgradeId: string) => number;
  getArkUpgradeById: (upgradeId: string) => ArkUpgrade | undefined;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Initialize on mount
  useEffect(() => {
    const savedGame = localStorage.getItem('forgenite_frenzy_save');
    if (savedGame) {
      try {
        const gameState = JSON.parse(savedGame);
        dispatch({ type: 'LOAD_GAME', payload: gameState });
      } catch (error) {
        console.error('Error loading saved game:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Auto-save
  useEffect(() => {
    if (state.playerProfile && state.isInitialSetupDone) {
      const saveTimeout = setTimeout(() => {
        localStorage.setItem('forgenite_frenzy_save', JSON.stringify(state));
      }, 1000);
      return () => clearTimeout(saveTimeout);
    }
  }, [state]);

  // Actions
  const completeInitialSetup = useCallback((profile: PlayerProfile) => {
    dispatch({ type: 'INIT_PLAYER', payload: profile });
  }, []);

  const addPoints = useCallback((points: number) => {
    dispatch({ type: 'ADD_POINTS', payload: points });
  }, []);

  const connectWallet = useCallback((address: string) => {
    dispatch({ type: 'CONNECT_WALLET', payload: address });
  }, []);

  const claimQuestReward = useCallback((questId: string) => {
    dispatch({ type: 'CLAIM_QUEST', payload: questId });
  }, []);

  const getUpgradeLevel = useCallback((upgradeId: string) => {
    return state.playerProfile?.upgrades[upgradeId] || 0;
  }, [state.playerProfile]);

  const getUpgradeCost = useCallback((upgradeId: string) => {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return 0;
    const currentLevel = getUpgradeLevel(upgradeId);
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
  }, [state.upgrades, getUpgradeLevel]);

  const purchaseUpgrade = useCallback((upgradeId: string) => {
    const cost = getUpgradeCost(upgradeId);
    if (state.playerProfile && state.playerProfile.points >= cost) {
      dispatch({ type: 'PURCHASE_UPGRADE', payload: { upgradeId, cost } });
    }
  }, [state.playerProfile, getUpgradeCost]);

  const getArkUpgradeById = useCallback((upgradeId: string) => {
    return state.arkUpgrades.find(u => u.id === upgradeId);
  }, [state.arkUpgrades]);

  const purchaseArkUpgrade = useCallback((upgradeId: string) => {
    const arkUpgrade = getArkUpgradeById(upgradeId);
    if (arkUpgrade && state.playerProfile && state.playerProfile.points >= arkUpgrade.cost) {
      dispatch({ type: 'PURCHASE_ARK_UPGRADE', payload: upgradeId });
    }
  }, [state.playerProfile, getArkUpgradeById]);

  const askCore = useCallback(async (question: string) => {
    // Simulate AI response
    const responses = [
      "Commander, our scanners indicate optimal conditions for resource extraction.",
      "The Cyber Concord's movements suggest they are unaware of our presence.",
      "Analysis complete: Our ark construction is proceeding ahead of schedule.",
      "Tactical assessment: Continue current operations for maximum efficiency."
    ];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    dispatch({
      type: 'ADD_CORE_MESSAGE',
      payload: {
        id: Date.now().toString(),
        type: 'tip',
        message: randomResponse,
        timestamp: Date.now()
      }
    });
  }, []);

  const setIsOpen = useCallback((isOpen: boolean) => {
    dispatch({ type: 'SET_CORE_OPEN', payload: isOpen });
  }, []);

  const setHasUnread = useCallback((hasUnread: boolean) => {
    dispatch({ type: 'SET_HAS_UNREAD', payload: hasUnread });
  }, []);

  const toggleMusic = useCallback(() => {
    dispatch({ type: 'TOGGLE_MUSIC' });
  }, []);

  const toggleCommander = useCallback(() => {
    dispatch({ type: 'TOGGLE_COMMANDER' });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const updatePlayerProfile = useCallback((updates: Partial<PlayerProfile>) => {
    dispatch({ type: 'UPDATE_PLAYER', payload: updates });
  }, []);

  const refreshDailyQuestsIfNeeded = useCallback(() => {
    dispatch({ type: 'REFRESH_QUESTS' });
  }, []);

  const purchasePremiumPass = useCallback(() => {
    dispatch({ type: 'PURCHASE_PREMIUM_PASS' });
  }, []);

  const claimBattlePassReward = useCallback((level: number, track: 'free' | 'premium') => {
    dispatch({ type: 'CLAIM_BATTLE_PASS_REWARD', payload: { level, track } });
  }, []);

  const purchaseMarketplaceItem = useCallback((itemId: string) => {
    // Stub implementation
    console.log('Purchase marketplace item:', itemId);
  }, []);

  const setPlayerProfile = useCallback((profileOrUpdater: PlayerProfile | ((prev: PlayerProfile | null) => PlayerProfile | null)) => {
    if (typeof profileOrUpdater === 'function') {
      // Handle updater function
      const newProfile = profileOrUpdater(state.playerProfile);
      if (newProfile) {
        dispatch({ type: 'INIT_PLAYER', payload: newProfile });
      }
    } else {
      dispatch({ type: 'INIT_PLAYER', payload: profileOrUpdater });
    }
  }, [state.playerProfile]);

  const watchRewardedAd = useCallback(() => {
    // Stub implementation
    console.log('Watch rewarded ad');
  }, []);

  const connectTelegramWallet = useCallback(() => {
    // Stub implementation
    console.log('Connect Telegram wallet');
  }, []);

  const purchaseWithTelegramWallet = useCallback((pkg: { amount: number; price: number }) => {
    // Stub implementation
    console.log('Purchase with Telegram wallet:', pkg);
  }, []);

  const handleTap = useCallback((isLogoTap: boolean) => {
    // Simple tap implementation
    if (state.playerProfile && state.playerProfile.currentTaps > 0) {
      addPoints(state.playerProfile.pointsPerTap || 1);
      dispatch({ type: 'UPDATE_PLAYER', payload: { currentTaps: state.playerProfile.currentTaps - 1 } });
    }
  }, [state.playerProfile, addPoints]);

  const value: GameContextValue = {
    // State
    playerProfile: state.playerProfile,
    isLoading: state.isLoading,
    isInitialSetupDone: state.isInitialSetupDone,
    currentSeason: state.currentSeason,
    dailyQuests: state.dailyQuests,
    upgrades: state.upgrades,
    arkUpgrades: state.arkUpgrades,
    coreMessages: state.coreMessages,
    isCoreUnlocked: state.isCoreUnlocked || (state.playerProfile?.level || 0) >= 5,
    battlePassData: state.battlePassData,
    isOpen: state.isOpen,
    hasUnread: state.hasUnread,
    isMusicPlaying: state.isMusicPlaying,
    marketplaceItems: state.marketplaceItems,
    rewardedAdCooldown: state.rewardedAdCooldown,
    isWatchingAd: state.isWatchingAd,
    isTelegramEnv: state.isTelegramEnv,
    
    // Actions
    completeInitialSetup,
    addPoints,
    connectWallet,
    claimQuestReward,
    purchaseUpgrade,
    purchaseArkUpgrade,
    askCore,
    setIsOpen,
    setHasUnread,
    toggleMusic,
    toggleCommander,
    resetGame,
    updatePlayerProfile,
    refreshDailyQuestsIfNeeded,
    purchasePremiumPass,
    claimBattlePassReward,
    purchaseMarketplaceItem,
    setPlayerProfile,
    watchRewardedAd,
    connectTelegramWallet,
    purchaseWithTelegramWallet,
    handleTap,
    
    // Utility functions
    getUpgradeLevel,
    getUpgradeCost,
    getArkUpgradeById
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
