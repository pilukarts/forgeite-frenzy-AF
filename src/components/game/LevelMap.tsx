"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Star, Crown, Sparkles, Zap } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';

interface Level {
  id: number;
  name: string;
  isCompleted: boolean;
  isUnlocked: boolean;
  stars: number;
  bossLevel?: boolean;
}

interface Stage {
  id: number;
  name: string;
  theme: string;
  levels: Level[];
  backgroundColor: string;
  accentColor: string;
  description: string;
}

const STAGES: Stage[] = [
  {
    id: 1,
    name: "Earth",
    theme: "🌍",
    description: "El hogar de la humanidad. Aprende los fundamentos.",
    backgroundColor: "from-green-400 via-blue-500 to-blue-600",
    accentColor: "from-green-300 to-blue-400",
    levels: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Nivel ${i + 1}`,
      isCompleted: false,
      isUnlocked: i === 0,
      stars: 0,
      bossLevel: (i + 1) % 10 === 0
    }))
  },
  {
    id: 2,
    name: "Moon", 
    theme: "🌙",
    description: "La primera frontera. Desafíos lunares te esperan.",
    backgroundColor: "from-purple-400 via-gray-400 to-slate-500",
    accentColor: "from-purple-300 to-gray-300",
    levels: Array.from({ length: 10 }, (_, i) => ({
      id: 11 + i,
      name: `Nivel ${11 + i}`,
      isCompleted: false,
      isUnlocked: false,
      stars: 0,
      bossLevel: (i + 1) % 10 === 0
    }))
  },
  {
    id: 3,
    name: "Mars",
    theme: "🔴",
    description: "El planeta rojo. Enfrenta tormentas marcianas.",
    backgroundColor: "from-red-500 via-orange-500 to-red-600",
    accentColor: "from-red-400 to-orange-400",
    levels: Array.from({ length: 10 }, (_, i) => ({
      id: 21 + i,
      name: `Nivel ${21 + i}`,
      isCompleted: false,
      isUnlocked: false,
      stars: 0,
      bossLevel: (i + 1) % 10 === 0
    }))
  },
  {
    id: 4,
    name: "Asteroid Belt",
    theme: "☄️",
    description: "Navega entre asteroides peligrosos.",
    backgroundColor: "from-yellow-600 via-amber-600 to-orange-600",
    accentColor: "from-yellow-500 to-amber-500",
    levels: Array.from({ length: 10 }, (_, i) => ({
      id: 31 + i,
      name: `Nivel ${31 + i}`,
      isCompleted: false,
      isUnlocked: false,
      stars: 0,
      bossLevel: (i + 1) % 10 === 0
    }))
  },
  {
    id: 5,
    name: "Deep Space",
    theme: "🌌",
    description: "Las profundidades del cosmos.",
    backgroundColor: "from-indigo-900 via-purple-900 to-black",
    accentColor: "from-indigo-700 to-purple-700",
    levels: Array.from({ length: 10 }, (_, i) => ({
      id: 41 + i,
      name: `Nivel ${41 + i}`,
      isCompleted: false,
      isUnlocked: false,
      stars: 0,
      bossLevel: (i + 1) % 10 === 0
    }))
  }
];

const LevelMap: React.FC = () => {
  const { playerProfile } = useGame();
  const [selectedStage, setSelectedStage] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const currentStage = STAGES.find(s => s.id === selectedStage) || STAGES[0];

  const getStageUnlocked = (stageId: number): boolean => {
    if (stageId === 1) return true;
    return false; // Simplified for now
  };

  const isLevelUnlocked = (stageId: number, levelIndex: number): boolean => {
    if (stageId === 1) {
      return levelIndex === 0; // Only first level unlocked in Earth
    }
    return false;
  };

  const handleLevelClick = (level: Level, stageId: number) => {
    if (!isLevelUnlocked(stageId, level.id - currentStage.levels[0].id)) {
      return;
    }
    setSelectedLevel(level);
  };

  const renderStar = (starIndex: number, totalStars: number) => (
    <Star 
      key={starIndex}
      className={`w-3 h-3 ${
        starIndex < totalStars 
          ? 'text-yellow-400 fill-yellow-400' 
          : 'text-gray-600'
      }`}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Mapa de Niveles
          </h1>
          <p className="text-gray-300">
            Explora las regiones del cosmos
          </p>
        </div>

        {/* Stage Navigation */}
        <div className="flex justify-center mb-8 overflow-x-auto pb-4">
          <div className="flex space-x-4 min-w-max px-4">
            {STAGES.map((stage) => {
              const isUnlocked = getStageUnlocked(stage.id);
              const isSelected = selectedStage === stage.id;
              
              return (
                <motion.button
                  key={stage.id}
                  onClick={() => isUnlocked && setSelectedStage(stage.id)}
                  disabled={!isUnlocked}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all duration-300 min-w-[160px]
                    ${isSelected 
                      ? 'border-yellow-400 bg-gradient-to-br ' + stage.backgroundColor 
                      : isUnlocked 
                        ? 'border-gray-600 bg-gray-800/50 hover:border-gray-400' 
                        : 'border-gray-700 bg-gray-900/50 cursor-not-allowed opacity-50'
                    }
                  `}
                  whileHover={isUnlocked ? { scale: 1.05 } : {}}
                  whileTap={isUnlocked ? { scale: 0.95 } : {}}
                >
                  {!isUnlocked && (
                    <Lock className="absolute top-2 right-2 w-5 h-5 text-gray-500" />
                  )}
                  
                  <div className="text-3xl mb-2">{stage.theme}</div>
                  <div className="text-white font-bold text-sm">{stage.name}</div>
                  <div className="text-gray-300 text-xs mt-1">
                    Niveles {stage.levels[0].id}-{stage.levels[stage.levels.length - 1].id}
                  </div>
                  
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 border-2 border-yellow-400 rounded-xl"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Stage Description */}
        <div className="text-center mb-8">
          <motion.div
            key={selectedStage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-gray-600 rounded-xl p-6 max-w-2xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center">
              <span className="text-3xl mr-3">{currentStage.theme}</span>
              {currentStage.name}
            </h2>
            <p className="text-gray-300">{currentStage.description}</p>
          </motion.div>
        </div>

        {/* Level Grid */}
        <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/50 rounded-2xl p-6 border border-gray-600">
          <div className="grid grid-cols-5 gap-4">
            {currentStage.levels.map((level, index) => {
              const isUnlocked = isLevelUnlocked(selectedStage, index);
              const isSelected = selectedLevel?.id === level.id;
              
              return (
                <motion.div
                  key={level.id}
                  onClick={() => handleLevelClick(level, selectedStage)}
                  className={`
                    relative aspect-square rounded-lg border-2 cursor-pointer transition-all duration-300
                    ${level.bossLevel ? 'border-red-400' : 'border-gray-600'}
                    ${isSelected 
                      ? 'bg-gradient-to-br ' + currentStage.accentColor + ' border-yellow-400' 
                      : isUnlocked 
                        ? 'bg-slate-700/50 hover:bg-slate-600/50 border-gray-500' 
                        : 'bg-gray-900/50 border-gray-700 cursor-not-allowed opacity-50'
                    }
                  `}
                  whileHover={isUnlocked ? { scale: 1.05 } : {}}
                  whileTap={isUnlocked ? { scale: 0.95 } : {}}
                  layout
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`font-bold text-sm ${
                      isUnlocked ? 'text-white' : 'text-gray-500'
                    }`}>
                      {level.id}
                    </span>
                  </div>

                  {level.bossLevel && (
                    <div className="absolute top-1 right-1">
                      <Crown className="w-3 h-3 text-red-400" />
                    </div>
                  )}

                  {level.isCompleted && (
                    <div className="absolute -top-1 -right-1 flex space-x-0">
                      {[0, 1, 2].map(starIndex => 
                        renderStar(starIndex, level.stars)
                      )}
                    </div>
                  )}

                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-gray-500" />
                    </div>
                  )}

                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 border-2 border-yellow-400 rounded-lg"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
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
                className="bg-gradient-to-br from-slate-800 to-slate-900 border border-gray-600 rounded-2xl p-6 max-w-md w-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedLevel.name}
                  </h3>
                  {selectedLevel.bossLevel && (
                    <div className="flex items-center justify-center space-x-2 text-red-400">
                      <Crown className="w-5 h-5" />
                      <span className="font-bold">Nivel Jefe</span>
                      <Crown className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedLevel.isCompleted && (
                    <div>
                      <h4 className="text-white font-bold mb-2">Estrellas Obtenidas:</h4>
                      <div className="flex space-x-2">
                        {[0, 1, 2].map(starIndex => 
                          renderStar(starIndex, selectedLevel.stars)
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => setSelectedLevel(null)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cerrar
                  </button>
                  {selectedLevel.isUnlocked && (
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white rounded-lg transition-all">
                      Jugar
                    </button>
                  )}
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