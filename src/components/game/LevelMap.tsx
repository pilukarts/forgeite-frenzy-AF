
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Star, Crown, Check, Zap } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { LEVEL_STAGES } from '@/lib/gameData';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface LevelNode {
  id: number;
  name: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isUnlocked: boolean;
  bossLevel?: boolean;
}

interface StageNode {
  id: number;
  name: string;
  theme: string;
  levels: LevelNode[];
  isUnlocked: boolean;
  startLevel: number;
  endLevel: number;
  backgroundColor: string;
  accentColor: string;
  description: string;
}

const LevelMap: React.FC = () => {
  const { playerProfile } = useGame();
  
  const getStageIdForLevel = (level: number) => {
    return LEVEL_STAGES.find(stage => level >= stage.startLevel && level <= stage.endLevel)?.name || LEVEL_STAGES[0].name;
  };

  // Find the stage name corresponding to the player's current level
  const currentStageName = useMemo(() => playerProfile ? getStageIdForLevel(playerProfile.level) : LEVEL_STAGES[0].name, [playerProfile]);
  
  const [selectedStageName, setSelectedStageName] = useState(currentStageName);
  const [selectedLevel, setSelectedLevel] = useState<LevelNode | null>(null);
  const currentLevelRef = useRef<HTMLDivElement>(null);

  const stages: StageNode[] = useMemo(() => {
    if (!playerProfile) return [];
    
    const { level: playerLevel } = playerProfile;

    return LEVEL_STAGES.map(stageData => {
      const isStageUnlocked = playerLevel >= stageData.startLevel;

      const levels: LevelNode[] = Array.from({ length: stageData.endLevel - stageData.startLevel + 1 }, (_, i) => {
        const levelId = stageData.startLevel + i;
        return {
          id: levelId,
          name: `Level ${levelId}`,
          isCompleted: playerLevel > levelId,
          isCurrent: playerLevel === levelId,
          isUnlocked: playerLevel >= levelId,
          bossLevel: levelId === stageData.endLevel
        };
      });

      return {
        id: stageData.startLevel,
        name: stageData.name,
        theme: "🚀", // Placeholder, can be customized
        levels,
        isUnlocked: isStageUnlocked,
        startLevel: stageData.startLevel,
        endLevel: stageData.endLevel,
        backgroundColor: `from-slate-900/80 to-slate-900/50`,
        accentColor: `from-yellow-400/50 to-yellow-500/50`,
        description: `Sector ${stageData.name}: Levels ${stageData.startLevel}-${stageData.endLevel}`
      };
    });
  }, [playerProfile]);

  useEffect(() => {
    if(currentLevelRef.current) {
        currentLevelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedStageName]);


  if (!playerProfile) return null;

  const currentStage = stages.find(s => s.name === selectedStageName) || stages[0];
  
  return (
    <div className="h-full w-full p-2 sm:p-4 text-white overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl sm:text-4xl font-headline text-primary mb-1">
            Starmap
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Your journey through the Alliance territories.
          </p>
        </div>

        {/* Stage Navigation */}
        <div className="flex justify-center mb-6 overflow-x-auto pb-2">
          <div className="flex space-x-2 sm:space-x-4 min-w-max px-4">
            {stages.map((stage) => {
              const isSelected = selectedStageName === stage.name;
              return (
                <motion.button
                  key={stage.id}
                  onClick={() => stage.isUnlocked && setSelectedStageName(stage.name)}
                  disabled={!stage.isUnlocked}
                  className={cn(
                    "relative p-2 sm:p-4 rounded-xl border-2 transition-all duration-300 min-w-[120px] sm:min-w-[160px]",
                    isSelected 
                      ? 'border-primary bg-primary/20' 
                      : stage.isUnlocked 
                        ? 'border-border bg-card/50 hover:border-primary/50' 
                        : 'border-border/50 bg-card/30 cursor-not-allowed opacity-60'
                  )}
                  whileHover={stage.isUnlocked ? { y: -5 } : {}}
                  whileTap={stage.isUnlocked ? { scale: 0.95 } : {}}
                >
                  {!stage.isUnlocked && (
                    <Lock className="absolute top-1 right-1 w-4 h-4 text-muted-foreground" />
                  )}
                  <div className="text-base sm:text-xl font-bold">{stage.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Levels {stage.startLevel}-{stage.endLevel}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Level Grid */}
        <div className="bg-card/30 rounded-2xl p-4 sm:p-6 border border-border/50">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 sm:gap-4">
            {currentStage.levels.map((level) => {
              return (
                <motion.div
                  ref={level.isCurrent ? currentLevelRef : null}
                  key={level.id}
                  onClick={() => level.isUnlocked && setSelectedLevel(level)}
                  className={cn(
                    "relative aspect-square rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                    level.isCurrent ? "bg-primary/30 border-primary ring-2 ring-primary/50 animate-pulse cursor-pointer" :
                    level.isCompleted ? "bg-green-500/30 border-green-500 cursor-pointer" :
                    level.isUnlocked ? "bg-card/50 border-border hover:bg-card/70 cursor-pointer" :
                    "bg-background/50 border-border/50 cursor-not-allowed opacity-50"
                  )}
                  whileHover={level.isUnlocked ? { scale: 1.1 } : {}}
                  whileTap={level.isUnlocked ? { scale: 0.95 } : {}}
                  layout
                >
                  <span className="font-bold text-sm sm:text-base">
                    {level.id}
                  </span>

                  {level.bossLevel && (
                    <div className="absolute -top-1.5 -right-1.5 text-red-400">
                      <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                  )}

                   {level.isCompleted && !level.isCurrent && (
                     <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-4 h-4 sm:w-6 sm:h-6 text-green-400" />
                    </div>
                  )}

                  {!level.isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Level Details Modal */}
        <AnimatePresence>
          {selectedLevel && (
            <motion.div
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLevel(null)}
            >
              <motion.div
                className="bg-background border-2 border-primary/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-headline text-primary mb-2">
                    {selectedLevel.name}
                  </h3>
                  {selectedLevel.bossLevel && (
                    <div className="flex items-center justify-center space-x-2 text-red-400">
                      <Crown className="w-5 h-5" />
                      <span className="font-bold">Boss Encounter</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 text-center text-muted-foreground">
                    {selectedLevel.isCompleted ? (
                        <p className="flex items-center justify-center gap-2 text-green-400"><Check className="h-5 w-5"/> Mission Complete</p>
                    ) : selectedLevel.isCurrent ? (
                        <p className="flex items-center justify-center gap-2 text-yellow-400"><Zap className="h-5 w-5"/> Current Objective</p>
                    ) : (
                         <p className="flex items-center justify-center gap-2"><Lock className="h-5 w-5"/> Locked</p>
                    )}
                     <p>Status: {selectedLevel.isCompleted ? 'Completed' : selectedLevel.isCurrent ? 'In Progress' : 'Locked'}</p>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() => setSelectedLevel(null)}
                    className="w-full"
                    variant="outline"
                  >
                    Close Transmission
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LevelMap;
