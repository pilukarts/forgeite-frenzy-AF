
"use client";
import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import BottomNavBar from "@/components/navigation/BottomNavBar";
import ResourceDisplay from "@/components/game/ResourceDisplay";
import { Button } from "@/components/ui/button";
import { useGame } from "@/contexts/GameContext";
import { Wallet, CreditCard, Zap } from "lucide-react";
import CoreDisplay from "@/components/core/CoreDisplay";
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
      <div className="bg-gray-800/50 shadow-sm p-1 rounded-md text-center">
        <p className="text-sm font-semibold text-yellow-300 flex items-center justify-center gap-1">
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
  
  if (isLoading) return <IntroScreen />;
  if (!isInitialSetupDone) return <PlayerSetup />;
  if (!playerProfile) return <IntroScreen />;

  const seasonProgress = playerProfile?.seasonProgress?.[currentSeason.id] ?? 0;

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white items-center">
        <div className="relative flex w-full h-full max-w-7xl mx-auto bg-gray-900/95 shadow-2xl overflow-hidden md:h-screen">
          <SidebarNav />

          <div className="flex flex-col flex-grow min-h-screen">
            {/* HEADER: Player info, resources, wallet connection */}
            <header
              className="sticky top-0 z-50 p-2 bg-background/80 backdrop-blur-md shadow-sm border-b border-border/50"
              aria-label="Top navigation"
            >
              <div className="flex items-center justify-between gap-2">
                {/* Left: Player Profile Header - no commander image here */}
                <div className="flex items-center gap-4 w-1/3">
                   {/* PlayerProfileHeader is removed from here to avoid showing the commander */}
                </div>

                {/* Center: Tap status */}
                <div className="flex-1 flex items-center justify-center">
                  <TapStatusCard />
                </div>

                {/* Right: Resources and Wallet */}
                <div className="flex items-center justify-end gap-1 w-1/3">
                  <ResourceDisplay seasonResourceAmount={seasonProgress} auronCount={playerProfile.auron ?? 0} />
                   <div className="flex flex-col items-start gap-1 ml-1 pl-1 border-l border-border">
                    <ConnectButton />
                  </div>
                </div>
              </div>
            </header>

            {/* MAIN: Renders the page content (e.g., the centered commander) */}
            <main className="flex-grow overflow-y-auto pb-14 flex flex-col">
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
