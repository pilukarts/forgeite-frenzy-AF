// File: app/page.tsx (or your main HomePage component)
"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import CommanderPortrait from '@/components/game/CommanderPortrait';
import PlayerSetup from '@/components/player/PlayerSetup';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Zap, AlertTriangle, Trophy, Ship, Share2, Send, Users, Globe, Coffee, Gamepad2, Replace, RefreshCw, Music, Music2, Bot } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { AURON_COST_FOR_TAP_REFILL, ALL_AVATARS, getLeagueIconAndColor } from '@/lib/gameData';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import IntroScreen from '@/components/intro/IntroScreen';
import images from '@/lib/placeholder-images';

const formatTimeLeft = (milliseconds: number): string => {
  if (milliseconds <= 0) return "00:00:00";
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Componente para los puntos animados
const AnimatedPoints = ({ points, onComplete }: { points: number, onComplete: () => void }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {Array.from({ length: points }).map((_, i) => (
          <motion.div
            key={`point-${i}`}
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 1,
              scale: 1,
              rotate: 0
            }}
            animate={{
              x: Math.random() * 200 - 100,
              y: Math.random() * 200 - 100,
              opacity: 0,
              scale: 1.5,
              rotate: 360
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.1,
              ease: "easeOut"
            }}
            onAnimationComplete={i === points - 1 ? onComplete : undefined}
            className="absolute top-1/2 left-1/2"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Layout optimizado: Comandante centrado + Ark countdown al lado
const CommanderWithArkCountdown = ({ 
  onTap, 
  onLogoTap, 
  tapCount,
  showPoints,
  timeLeft
}: { 
  onTap: (isLogoTap: boolean) => void;
  onLogoTap: () => void;
  tapCount: number;
  showPoints: boolean;
  timeLeft: { days: number; hours: number; minutes: number; seconds: number };
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 w-full h-full p-4">
      
      {/* COMANDANTE CENTRADO */}
      <motion.div
        className="relative cursor-pointer"
        onClick={() => onTap(false)}
        whileTap={{ scale: 0.9 }}
        animate={tapCount > 0 ? { 
          scale: [1, 1.1, 1],
          rotate: [0, 2, -2, 0]
        } : {}}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-32 h-32 md:w-40 md:h-40 border-4 border-primary/50 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm">
            <CommanderPortrait
              onTap={() => onTap(false)}
              onLogoTap={onLogoTap}
            />
          </div>
          {/* Indicador de tap */}
          {tapCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: -5 }}
              className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold"
            >
              +{tapCount * 10}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ARK COUNTDOWN AL LADO */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 50 }}
        className="relative cursor-pointer"
        onClick={() => onLogoTap()}
      >
        <Card className="bg-background/95 backdrop-blur-md p-4 text-center shadow-2xl border-primary/30 min-w-[240px] max-w-[280px]">
          <CardContent className="p-3 flex flex-col items-center space-y-3">
            {/* Imagen del Ark más grande */}
            <div className="relative h-24 w-24 md:h-32 md:w-32">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full animate-pulse"></div>
              <Image 
                src={images?.ark?.ark || "/images/global/star-ark-forge.png"}
                alt="Star-Forge Ark" 
                fill 
                style={{objectFit: 'contain'}} 
                unoptimized
                data-ai-hint="colony spaceship" 
                className="drop-shadow-2xl filter brightness-110"
              />
            </div>
            
            {/* Título del Countdown */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground font-semibold mb-1">NEW GAME LAUNCH</p>
              <p className="text-xs text-primary/80 mb-2">Arx Emigration Protocol</p>
            </div>
            
            {/* Tiempo restante */}
            <div className="text-center">
              <div className="text-sm md:text-base font-bold text-primary tabular-nums bg-primary/10 px-4 py-2 rounded-full space-x-1">
                <span>{String(timeLeft.days).padStart(2, '0')}d</span>
                <span>:</span>
                <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
                <span>:</span>
                <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
                <span>:</span>
                <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>
            </div>
            
            {/* Barra de progreso visual */}
            <div className="w-full bg-secondary/30 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                initial={{ width: "0%" }}
                animate={{ 
                  width: `${Math.max(0, 100 - ((timeLeft.days * 24 * 60 * 60 + timeLeft.hours * 60 * 60 + timeLeft.minutes * 60 + timeLeft.seconds) / (30 * 24 * 60 * 60)) * 100)}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const ArkCountdown = () => {
    const calculateTimeLeft = () => {
        const launchDate = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000); // Set 30 days from now
        const now = new Date();
        const difference = launchDate.getTime() - now.getTime();
        
        let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    return timeLeft;
};

export default function HomePage() {
  const { playerProfile, isLoading, isInitialSetupDone, handleTap, refillTaps, currentSeason, toggleCommander, toggleMusic, isMusicPlaying, resetGame } = useGame();
  const { toast } = useToast();
  
  // Estados para las animaciones
  const [tapCount, setTapCount] = useState(0);
  const [showPoints, setShowPoints] = useState(false);
  const [animationPoints, setAnimationPoints] = useState(0);
  const timeLeft = ArkCountdown();

  if (isLoading) {
    return <IntroScreen />;
  }

  if (!isInitialSetupDone || !playerProfile) {
      return <PlayerSetup />;
  }

  // Función mejorada de tap con animaciones
  const handleTapWithAnimation = async (isLogoTap: boolean) => {
    setTapCount(prev => prev + 1);
    setShowPoints(true);
    
    // Generar puntos aleatorios para la animación
    const pointsToShow = Math.floor(Math.random() * 5) + 3;
    setAnimationPoints(pointsToShow);
    
    // Ejecutar el tap original
    handleTap(isLogoTap);
    
    // Ocultar animación después de un tiempo
    setTimeout(() => {
      setShowPoints(false);
      setTapCount(0);
    }, 2000);
  };

  const handleInviteClick = async () => {
    if (!playerProfile.referralCode) return;
    
    const referralLink = `https://forgeite-frenzy.web.app/?ref=${playerProfile.referralCode}`; 
    const shareData = {
      title: 'Join Alliance Forge!',
      text: `Join my alliance in Forgeite Frenzy and help humanity's escape! Use my link to get a head start.`,
      url: referralLink,
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(referralLink);
            toast({ title: "Referral Link Copied!", description: "Your invite link has been copied." });
        }
    } catch (err) {
        console.error('Share/Copy failed:', err);
        await navigator.clipboard.writeText(referralLink);
        toast({ title: "Referral Link Copied!", description: "Sharing failed, link copied instead." });
    }
  };

  const seasonProgress = playerProfile.seasonProgress?.[currentSeason.id] ?? 0;
  const { Icon: LeagueIcon, colorClass: leagueColorClass } = getLeagueIconAndColor(playerProfile.league);
  const SeasonIcon = currentSeason.objectiveResourceIcon || Ship;

  return (
    <>
      {/* Puntos Animados */}
      {showPoints && (
        <AnimatedPoints 
          points={animationPoints} 
          onComplete={() => setShowPoints(false)} 
        />
      )}

      <div className="grid grid-cols-1 grid-rows-1 h-full w-full overflow-hidden">
        {/* Layer 1: Background */}
        <div 
          className="col-start-1 row-start-1 bg-cover bg-center"
          style={{ backgroundImage: `url('/images/global/main_scene.jpg')` }}
        />

        {/* Layer 2: Commander + Ark Layout */}
        <div className="col-start-1 row-start-1 flex items-center justify-center pointer-events-auto">
          <CommanderWithArkCountdown
            onTap={handleTapWithAnimation}
            onLogoTap={() => handleTapWithAnimation(true)}
            tapCount={tapCount}
            showPoints={showPoints}
            timeLeft={timeLeft}
          />
        </div>

        {/* Layer 3: UI Panels */}
        <div className="col-start-1 row-start-1 grid grid-cols-[auto_1fr_auto] grid-rows-[1fr_auto] h-full w-full p-2 md:p-4 gap-2 md:gap-4 pointer-events-none">
            
            {/* Left Action Bar */}
            <motion.div 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 50 }}
                className="hidden md:flex flex-col gap-1.5 w-[180px] flex-shrink-0 pointer-events-auto"
            >
                  <Dialog>
                    <DialogTrigger asChild>
                        <Button onClick={toggleCommander} variant="outline" size="sm" className="bg-background/70 backdrop-blur-sm justify-start gap-1.5 w-full">
                            <Replace className="h-4 w-4" /> Switch Commander
                        </Button>
                    </DialogTrigger>
                  </Dialog>

                  <Button onClick={toggleMusic} variant="outline" size="sm" className="bg-background/70 backdrop-blur-sm justify-start gap-1.5 w-full">
                    {isMusicPlaying ? <Music className="h-4 w-4" /> : <Music2 className="h-4 w-4" />} Music {isMusicPlaying ? "On" : "Off"}
                  </Button>
                  
                  <Card className="bg-background/70 backdrop-blur-sm p-1.5 w-full text-left">
                    <CardContent className="p-0">
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><SeasonIcon className="h-3 w-3" /> {currentSeason.objectiveResourceName}</p>
                        <p className="text-sm font-bold text-primary">{seasonProgress.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-background/70 backdrop-blur-sm p-1.5 w-full text-left">
                    <CardContent className="p-0">
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Trophy className={cn("h-3 w-3", leagueColorClass)} /> League</p>
                        <p className={cn("text-sm font-bold", leagueColorClass)}>{playerProfile.league}</p>
                    </CardContent>
                  </Card>

            </motion.div>

            {/* Empty Center Column */}
            <div className="col-start-2 row-span-2"></div>
            
            {/* Right Action Bar */}
             <motion.div 
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 50 }}
                className="hidden md:flex flex-col gap-1.5 w-[180px] flex-shrink-0 pointer-events-auto"
            >
                  <Button asChild variant="outline" size="sm" className="bg-background/70 backdrop-blur-sm justify-start gap-1.5 w-full link-glow">
                    <a href="https://allianceforge.online" target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4" /> Website
                    </a>
                  </Button>
                  
                  <Button onClick={handleInviteClick} variant="outline" size="sm" className="bg-background/70 backdrop-blur-sm justify-start gap-1.5 w-full link-glow">
                    <Share2 className="h-4 w-4" /> Invite
                  </Button>

                   <Button asChild variant="outline" size="sm" className="bg-background/70 backdrop-blur-sm justify-start gap-1.5 w-full link-glow">
                    <a href="https://t.me/AllianceForgeHQ" target="_blank" rel="noopener noreferrer">
                       <Send className="h-4 w-4" /> Comunidad
                    </a>
                  </Button>
                  
                  <Button asChild variant="outline" size="sm" className="bg-background/70 backdrop-blur-sm justify-start gap-1.5 w-full link-glow">
                    <a href="https://t.me/ForgeiteFrenzyGame_bot" target="_blank" rel="noopener noreferrer">
                       <Bot className="h-4 w-4" /> TG Mini App
                    </a>
                  </Button>

                   <Button asChild variant="outline" size="sm" className="bg-background/70 backdrop-blur-sm justify-start gap-1.5 w-full link-glow">
                    <a href="https://x.com/AllianceForgeHQ" target="_blank" rel="noopener noreferrer">
                      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 fill-current mr-1.5"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
                      X (Twitter)
                    </a>
                  </Button>
                   <Button asChild variant="outline" size="sm" className="bg-background/70 backdrop-blur-sm justify-start gap-1.5 w-full link-glow">
                    <a href="https://discord.gg/xnWDwGBC" target="_blank" rel="noopener noreferrer">
                      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current mr-1.5"><title>Discord</title><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.446.825-.667 1.284-1.39-1.29-3.91-1.516-3.91-1.516l-.044-.02-3.91 1.516c-.22-.46-.456-.909-.667-1.284a.074.074 0 0 0-.078-.037A19.791 19.791 0 0 0 3.682 4.37a.069.069 0 0 0-.032.023C.543 9.046-.32 13.58.1 18.058a.08.08 0 0 0 .041.058c1.837.775 3.652 1.165 5.447 1.165a12.602 12.602 0 0 0 2.378-.221.074.074 0 0 0 .063-.056c.208-1.01.43-2.06.435-2.22a.074.074 0 0 0-.045-.083c-.933-.424-1.782-1.026-2.52-1.844a.074.074 0 0 1 .018-.11c0-.009.012-.018.036-.027a10.872 10.872 0 0 1 2.982-1.108.074.074 0 0 1 .084.026c.462.632 1.053 1.253 1.725 1.799a.074.074 0 0 0 .084.026c.1.13-.39 2.1-1.107 2.982-1.107.012 0 .024.009.036.027a.074.074 0 0 1 .018.11c-.738.818-1.587 1.42-2.52 1.844a.074.074 0 0 0-.045-.083c.005.16.227 1.21.435 2.22a.074.074 0 0 0 .063.056c.792.264 1.582.424 2.378.221 1.795 0 3.61-.39 5.447-1.165a.08.08 0 0 0 .041-.058c.418-4.478-1.242-9.012-4.015-13.664a.069.069 0 0 0-.032-.023zM8.02 15.33c-.94 0-1.7-.76-1.7-1.7s.76-1.7 1.7-1.7 1.7.76 1.7 1.7-.76 1.7-1.7 1.7zm7.96 0c-.94 0-1.7-.76-1.7-1.7s.76-1.7 1.7-1.7 1.7.76 1.7 1.7-.76 1.7-1.7 1.7z" /></svg>
                       Discord
                    </a>
                  </Button>
            </motion.div>
        </div>
      </div>
    </>
  );
}