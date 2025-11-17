import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { PlayerData } from '@/components/player/PlayerSetup';
interface GameState {
player: PlayerData | null;
points: number;
pointsPerSecond: number;
currentStreak: number;
criticalHits: number;
comboBonus: number;
dronesCount: number;
isGameActive: boolean;
lastSave: number;
dailyQuests: DailyQuest[];
achievements: Achievement[];
battlePass: BattlePassProgress;
}
interface DailyQuest {
id: string;
title: string;
description: string;
progress: number;
target: number;
reward: number;
completed: boolean;
expiresAt: number;
}
interface Achievement {
id: string;
title: string;
description: string;
unlocked: boolean;
unlockedAt?: number;
}
interface BattlePassProgress {
level: number;
experience: number;
experienceToNext: number;
premiumTrackUnlocked: boolean;
rewardsClaimed: string[];
}
type GameAction =
| { type: 'INIT_PLAYER'; payload: PlayerData }
| { type: 'ADD_POINTS'; payload: number }
| { type: 'TAP_COMMANDER' }
| { type: 'LEVEL_UP' }
| { type: 'BUY_DRONE' }
| { type: 'CLAIM_QUEST_REWARD'; payload: string }
| { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
| { type: 'SAVE_GAME' }
| { type: 'LOAD_GAME'; payload: GameState }
| { type: 'RESET_GAME' };
const INITIAL_QUEST: DailyQuest[] = [
{
id: 'daily_taps',
title: 'Toca el Comandante',
description: 'Toca al comandante 100 veces',
progress: 0,
target: 100,
reward: 500,
completed: false,
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
expiresAt: Date.now() + 24 * 60 * 60 * 1000
}
];
const INITIAL_ACHIEVEMENTS: Achievement[] = [
{ id: 'first_tap', title: 'Primer Toque', description: 'Toca al comandante por primera vez', unlocked: false },
{ id: 'level_5', title: 'Nivel 5', description: 'Alcanza el nivel 5', unlocked: false },
{ id: '1000_points', title: 'Mil Puntos', description: 'Acumula 1,000 puntos totales', unlocked: false },
{ id: 'first_drone', title: 'Primer Drone', description: 'Compra tu primer drone M.U.L.E.', unlocked: false },
{ id: 'critical_master', title: 'Maestro Crítico', description: 'Consigue 100 golpes críticos', unlocked: false }
];
const initialState: GameState = {
player: null,
points: 0,
pointsPerSecond: 0,
currentStreak: 0,
criticalHits: 0,
comboBonus: 1.0,
dronesCount: 0,
isGameActive: false,
lastSave: 0,
dailyQuests: INITIAL_QUEST,
achievements: INITIAL_ACHIEVEMENTS,
battlePass: {
level: 1,
experience: 0,
experienceToNext: 1000,
premiumTrackUnlocked: false,
rewardsClaimed: []
}
};
function gameReducer(state: GameState, action: GameAction): GameState {
switch (action.type) {
case 'INIT_PLAYER':
return {
...state,
player: action.payload,
isGameActive: true,
points: action.payload.points,
totalPoints: action.payload.totalPoints
};
case 'ADD_POINTS':
const newPoints = state.points + action.payload;
const newTotalPoints = state.player ? state.player.totalPoints + action.payload : action.payload;
return {
...state,
points: newPoints,
player: state.player ? {
...state.player,
totalPoints: newTotalPoints
} : null
};
case 'TAP_COMMANDER':
const basePoints = 1;
const isCritical = Math.random() < 0.2; // 20% chance
const criticalMultiplier = isCritical ? 2 : 1;
const streakMultiplier = Math.min(1 + (state.currentStreak * 0.1), 3);
const totalMultiplier = criticalMultiplier * state.comboBonus * streakMultiplier;
const earnedPoints = basePoints * totalMultiplier;
const newStreak = isCritical ? state.currentStreak + 1 : 0;
const newCriticalHits = isCritical ? state.criticalHits + 1 : state.criticalHits;
// Actualizar quests
const updatedQuests = state.dailyQuests.map(quest => {
if (quest.id === 'daily_taps') {
return { ...quest, progress: quest.progress + 1 };
}
if (quest.id === 'daily_points') {
return { ...quest, progress: quest.progress + earnedPoints };
}
if (quest.id === 'daily_criticals' && isCritical) {
return { ...quest, progress: quest.progress + 1 };
}
return quest;
});
return {
...state,
points: state.points + earnedPoints,
currentStreak: newStreak,
criticalHits: newCriticalHits,
dailyQuests: updatedQuests
};
case 'LEVEL_UP':
if (!state.player) return state;
const newLevel = state.player.level + 1;
const newRank = getRankForLevel(newLevel);
const newExperience = state.player.experience - state.player.experienceToNext;
const newExperienceToNext = Math.floor(100 * Math.pow(1.5, newLevel - 1));
return {
...state,
player: {
...state.player,
level: newLevel,
rank: newRank,
experience: newExperience,
experienceToNext: newExperienceToNext
}
};
case 'BUY_DRONE':
return {
...state,
dronesCount: state.dronesCount + 1,
pointsPerSecond: state.pointsPerSecond + 0.5
};
case 'SAVE_GAME':
localStorage.setItem('forgenite_frenzy_save', JSON.stringify(state));
return { ...state, lastSave: Date.now() };
case 'LOAD_GAME':
return action.payload;
case 'RESET_GAME':
return {
...initialState,
lastSave: Date.now()
};
default:
return state;
}
}
function getRankForLevel(level: number): string {
if (level >= 75) return 'Maestro';
if (level >= 50) return 'General';
if (level >= 35) return 'Comandante';
if (level >= 25) return 'Capitán';
if (level >= 15) return 'Teniente';
if (level >= 10) return 'Sargento';
if (level >= 5) return 'Soldado';
return 'Recluta';
}
const GameContext = createContext<{
state: GameState;
dispatch: React.Dispatch<GameAction>;
} | null>(null);
export function GameProvider({ children }: { children: React.ReactNode }) {
const [state, dispatch] = useReducer(gameReducer, initialState);
// Auto-save every 30 seconds
useEffect(() => {
if (state.isGameActive && state.player) {
const interval = setInterval(() => {
dispatch({ type: 'SAVE_GAME' });
}, 30000);
return () => clearInterval(interval);
}
}, [state.isGameActive, state.player]);
// Load saved game on mount
useEffect(() => {
const savedGame = localStorage.getItem('forgenite_frenzy_save');
if (savedGame) {
try {
const gameState = JSON.parse(savedGame);
dispatch({ type: 'LOAD_GAME', payload: gameState });
} catch (error) {
console.error('Error loading saved game:', error);
}
}
}, []);
// Drone generation
useEffect(() => {
if (state.isGameActive && state.dronesCount > 0) {
const interval = setInterval(() => {
const dronePoints = state.dronesCount * 0.5;
dispatch({ type: 'ADD_POINTS', payload: dronePoints });
}, 1000);
return () => clearInterval(interval);
}
}, [state.isGameActive, state.dronesCount]);
return (
<GameContext.Provider value={{ state, dispatch }}>
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