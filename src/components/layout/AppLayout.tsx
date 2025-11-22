"use client";
import React, { ReactNode, useEffect, useState } from "react";
import BottomNavBar from "@/components/navigation/BottomNavBar";
import ResourceDisplay from "@/components/game/ResourceDisplay";
import { Button } from "@/components/ui/button";
import { useGame } from "@/contexts/GameContext";
import { Wallet, CreditCard, Zap } from "lucide-react";
import CoreDisplay from "@/components/core/CoreDisplay";
import Link from "next/link";
import IntroScreen from "@/components/intro/IntroScreen";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import PlayerSetup from "@/components/player/PlayerSetup";
import SidebarNav from "@/components/navigation/SidebarNav";
import { Card, CardContent } from "@/components/ui/card";
import LiveDashboard from "@/components/game/LiveDashboard";
import CommanderCenter from "@/components/game/CommanderCenter";
import ArkForgePanel from "@/components/game/ArkForgePanel";
import RightSideButtons from "@/components/game/RightSideButtons";
import PlayerProfileHeader from "../player/PlayerProfileHeader";
import images from "@/lib/placeholder-images.json";

interface AppLayoutProps {
  children: ReactNode;
}

const formatTimeLeft = (milliseconds: number): string => {
  if (milliseconds <= 0) return "00:00:00";
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const TapStatusCard: React.FC = () => {
  const { playerProfile } = useGame();
  const [timeLeftForTapRegen, setTimeLeftForTapRegen] = useState<number | null>(null);

  useEffect(() => {
    if (!playerProfile) return;
    const calculateInitialTime = () => {
      const remaining = (playerProfile.tapsAvailableAt || 0) - Date.now();
      setTimeLeftForTapRegen(Math.max(0, remaining));
    };
    calculateInitialTime();
    const timerId = setInterval(() => {
      setTimeLeftForTapRegen((prevTime) => {
        if (prevTime === null) return null;
        if (prevTime <= 1000) {
          if (playerProfile.currentTaps < playerProfile.maxTaps) {
            const remaining = (playerProfile.tapsAvailableAt || 0) - Date.now();
            return Math.max(0, remaining);
          }
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [playerProfile]);

  if (!playerProfile) return null;
  const isOutOfTaps = playerProfile.currentTaps <= 0 && timeLeftForTapRegen !== null && timeLeftForTapRegen > 0;

  return (
    <div className="w-full max-w-xs">
      <div className="bg-card/50 shadow-sm p-1 rounded-md text-center">
        <p className="text-sm font-semibold text-primary font-headline flex items-center justify-center gap-1">
          <Zap className="h-4 w-4" /> Taps: {playerProfile.currentTaps.toLocaleString()} / {playerProfile.maxTaps.toLocaleString()}
        </p>
        {isOutOfTaps && timeLeftForTapRegen !== null && (
          <p className="text-xs text-orange-400 animate-pulse">Regen in: {formatTimeLeft(timeLeftForTapRegen)}</p>
        )}
      </div>
    </div>
  );
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { playerProfile, connectWallet, currentSeason, isLoading, isInitialSetupDone /*, registerTap? */ } = useGame();
  const [commanderModalOpen, setCommanderModalOpen] = useState(false);

  useEffect(() => {
    if (!playerProfile) setCommanderModalOpen(false);
  }, [playerProfile]);

  if (isLoading) return <IntroScreen />;
  if (!isInitialSetupDone) return <PlayerSetup />;
  if (!playerProfile) return <IntroScreen />;

  const seasonProgress = playerProfile?.seasonProgress?.[currentSeason.id] ?? 0;

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <div className="relative flex w-full max-w-7xl mx-auto bg-background/95 shadow-2xl overflow-hidden md:h-auto">
          <SidebarNav />

          <div className="flex flex-col flex-grow min-h-screen">
            {/* HEADER: Contains profile, status, and resources */}
            <header className="sticky top-0 z-50 p-2 bg-background/80 backdrop-blur-md shadow-sm border-b border-border/50">
              <div className="flex items-center justify-between gap-2">
                {/* Left: logo / small profile */}
                <div className="flex items-center gap-4">
                  <PlayerProfileHeader profile={playerProfile} />
                </div>

                {/* Center: top taps / status */}
                <div className="flex-1 flex items-center justify-center">
                  <TapStatusCard />
                </div>

                {/* Right: connect / buy etc */}
                <div className="flex items-start gap-1">
                  <ResourceDisplay seasonResourceAmount={seasonProgress} auronCount={playerProfile.auron ?? 0} />
                  <div className="flex flex-col items-start gap-1 ml-1 pl-1 border-l border-border">
                    {/* wallet / buy buttons */}
                    <ConnectButton />
                  </div>
                </div>
              </div>
            </header>

            {/* MAIN / TAP AREA */}
            <main className="flex-grow overflow-y-auto pb-[56px] md:pb-0 flex flex-col">
              {children}
            </main>

            <CoreDisplay />
            <LiveDashboard />
            <BottomNavBar />
          </div>
        </div>
      </div>
    </>
  );
};

export default AppLayout;
