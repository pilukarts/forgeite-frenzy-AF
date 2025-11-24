"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CommanderSelection, { Commander, AVAILABLE_COMMANDERS } from '@/components/game/CommanderSelection';
import { useGame, PlayerProfile } from '@/contexts/GameContext';

const INITIAL_RANKS = [
  { name: 'Recluta', minLevel: 1, color: 'text-gray-400' },
  { name: 'Soldado', minLevel: 5, color: 'text-green-400' },
  { name: 'Sargento', minLevel: 10, color: 'text-blue-400' },
  { name: 'Teniente', minLevel: 15, color: 'text-purple-400' },
  { name: 'Capitán', minLevel: 25, color: 'text-yellow-400' },
  { name: 'Comandante', minLevel: 35, color: 'text-orange-400' },
  { name: 'General', minLevel: 50, color: 'text-red-400' },
  { name: 'Maestro', minLevel: 75, color: 'text-pink-400' }
];

export default function PlayerSetup() {
  const { completeInitialSetup } = useGame();
  const [step, setStep] = useState<'name' | 'commander'>('name');
  const [playerName, setPlayerName] = useState('');
  const [selectedCommander, setSelectedCommander] = useState<Commander | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNameSubmit = () => {
    if (playerName.trim().length >= 2) {
      setStep('commander');
    }
  };

  const handleCommanderSelect = async (commander: Commander) => {
    setSelectedCommander(commander);
    
    // Simulate loading
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create initial player profile
    const playerProfile: PlayerProfile = {
      id: Date.now().toString(),
      name: playerName.trim(),
      commanderId: commander.id,
      commanderSex: 'male',
      portraitUrl: '/images/global/commander-man-full.png',
      level: 1,
      rank: INITIAL_RANKS[0].name,
      experience: 0,
      experienceToNext: 100,
      points: 0,
      totalPoints: 0,
      pointsPerTap: 1,
      achievements: ['Bienvenido al Cyber Concord'],
      isWalletConnected: false,
      isTelegramWalletConnected: false,
      auron: 0,
      currentTaps: 100,
      maxTaps: 100,
      tapsAvailableAt: 0,
      upgrades: {},
      seasonProgress: {},
      activeDailyQuests: [],
      activeTapBonuses: [],
      battlePassLevel: 1,
      battlePassXp: 0,
      xpToNextBattlePassLevel: 1000,
      hasPremiumPass: false,
      claimedBattlePassRewards: {},
      currentTierColor: 'cyan',
      coreVoiceProtocol: 'standard',
      referralCode: `REF-${Date.now().toString(36).toUpperCase()}`
    };
    
    completeInitialSetup(playerProfile);
  };

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    }
  };

  if (step === 'name') {
    return (
      <div className="max-w-md mx-auto p-4">
        <Card className="bg-gradient-to-br from-blue-900 to-purple-900 border-blue-600">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl text-white">Forgenite Frenzy</CardTitle>
            <p className="text-blue-200">Ingresa tu nombre de comandante</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="playerName" className="text-blue-200">
                Nombre del Comandante
              </Label>
              <Input
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={handleNameKeyPress}
                placeholder="Ej: CommanderX"
                className="bg-blue-900/50 border-blue-500 text-white placeholder-blue-300"
                maxLength={20}
              />
              <p className="text-xs text-blue-300">
                Mínimo 2 caracteres
              </p>
            </div>
            
            <Button 
              onClick={handleNameSubmit}
              disabled={playerName.trim().length < 2}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Continuar
            </Button>
          </CardContent>
        </Card>
        
        {/* Game info */}
        <Card className="mt-6 bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <h3 className="text-sm font-semibold text-gray-300">Misión: Escapar de Cyber Concord</h3>
              <p className="text-xs text-gray-400">
                Completa quests, gana experiencia y construye tu Ark para llegar a Sanctaris
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'commander') {
    return (
      <div className="space-y-6 p-4">
        <Card className="bg-gradient-to-r from-purple-900 to-blue-900 border-purple-600">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-white">¡Bienvenido, {playerName}!</h2>
              <p className="text-purple-200">Selecciona tu comandante para comenzar la misión</p>
            </div>
          </CardContent>
        </Card>
        
        <CommanderSelection
          selectedCommander={selectedCommander}
          onCommanderSelect={handleCommanderSelect}
          currentLevel={1}
        />
        
        {isLoading && (
          <Card className="bg-blue-900 border-blue-600">
            <CardContent className="p-6 text-center">
              <div className="space-y-2">
                <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-blue-300">Iniciando misión...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return null;
}
