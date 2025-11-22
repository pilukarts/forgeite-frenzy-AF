"use client";
import React, { ReactNode, useEffect, useState } from "react";
import BottomNavBar from "@/components/navigation/BottomNavBar";
import PlayerProfileHeader from "@/components/player/PlayerProfileHeader";
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
    <Card className="bg-card/50 shadow-sm flex-grow text-center p-1">
      <CardContent className="p-0">
        <p className="text-sm font-semibold text-primary font-headline flex items-center justify-center gap-1">
          <Zap className="h-4 w-4" /> Taps: {playerProfile.currentTaps.toLocaleString()} / {playerProfile.maxTaps.toLocaleString()}
        </p>
        {isOutOfTaps && timeLeftForTapRegen !== null && (
          <p className="text-xs text-orange-400 animate-pulse">Regen in: {formatTimeLeft(timeLeftForTapRegen)}</p>
        )}
      </CardContent>
    </Card>
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
      <div className="flex flex-col min-h-screen bg-background text-foreground items-center justify-center">
        <div className="relative flex w-full h-full max-w-7xl mx-auto bg-background/95 shadow-2xl overflow-hidden md:h-screen">
          <SidebarNav />
          <div className="flex flex-col flex-grow min-h-screen">
            {/* HEADER / HERO (NO IMAGES, NO COMMANDER HERE) */}
            <header className="sticky top-0 z-50 p-2 bg-background/80 backdrop-blur-md shadow-sm border-b border-border/50">
              <div className="flex items-center justify-between gap-2">
                <PlayerProfileHeader profile={playerProfile} />
                <TapStatusCard />
                <div className="flex items-start gap-1">
                  <ResourceDisplay seasonResourceAmount={seasonProgress} auronCount={playerProfile.auron ?? 0} />
                  <div className="flex flex-col items-start gap-1 ml-1 pl-1 border-l border-border">
                    <ConnectButton.Custom>
                      {({
                        account,
                        chain,
                        openAccountModal,
                        openChainModal,
                        openConnectModal,
                        authenticationStatus,
                        mounted,
                      }) => {
                        const ready = mounted && authenticationStatus !== "loading";
                        const connected =
                          ready &&
                          account &&
                          chain &&
                          (!authenticationStatus || authenticationStatus === "authenticated");

                        useEffect(() => {
                          if (connected && account?.address && !playerProfile.isWalletConnected) {
                            connectWallet(account.address);
                          }
                        }, [connected, account?.address, connectWallet, playerProfile.isWalletConnected]);

                        return (
                          <div
                            {...(!ready && {
                              "aria-hidden": true,
                              style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
                            })}
                          >
                            {(() => {
                              if (!connected) {
                                return (
                                  <Button
                                    onClick={openConnectModal}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="bg-primary/20 border-primary text-primary-foreground hover:bg-primary/30 whitespace-nowrap text-xs px-2 h-7 w-full justify-start"
                                  >
                                    <Wallet className="mr-1.5 h-3 w-3 text-bright-gold" /> Connect
                                  </Button>
                                );
                              }

                              if (chain?.unsupported) {
                                return (
                                  <Button onClick={openChainModal} type="button" variant="destructive" size="sm" className="whitespace-nowrap text-xs px-2 h-7 w-full justify-start">
                                    Wrong network
                                  </Button>
                                );
                              }

                              return (
                                <div className="flex gap-x-1">
                                  <Button onClick={openChainModal} type="button" size="sm" variant="outline" className="text-xs px-2 h-7">
                                    {chain.hasIcon && (
                                      <div style={{ background: chain.iconBackground, width: 12, height: 12, borderRadius: 999, overflow: "hidden", marginRight: 4 }}>
                                        {chain.iconUrl && <img alt={chain.name ?? "Chain icon"} src={chain.iconUrl} style={{ width: 12, height: 12 }} />}
                                      </div>
                                    )}
                                    {chain.name}
                                  </Button>
                                  <Button onClick={openAccountModal} type="button" size="sm" variant="outline" className="text-xs px-2 h-7">
                                    {account.displayName}
                                  </Button>
                                </div>
                              );
                            })()}
                          </div>
                        );
                      }}
                    </ConnectButton.Custom>

                    <Button asChild variant="outline" size="sm" className="bg-primary/20 border-primary text-primary-foreground hover:bg-primary/30 whitespace-nowrap text-xs px-2 h-7 w-full justify-start">
                      <Link href="/marketplace">
                        <CreditCard className="mr-1.5 h-3 w-3" /> Buy
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            {/* TAP AREA: commander full-body, centered and tappable (moved OUT of hero) */}
            <main className="flex-grow overflow-y-auto pb-[56px] md:pb-0 flex flex-col">
              <section id="tap-area" className="w-full mt-4">
                <div className="w-full max-w-7xl mx-auto flex items-center justify-center relative">
                  <CommanderCenter
                    fullBodyUrl={
                      playerProfile.avatarUrl ??
                      (playerProfile.commanderSex === "female" ? "/images/commander-woman-full.png" : "/images/commander-man-full.png")
                    }
                    showHalo={true}
                    rightOffset="9rem"
                    onAvatarClick={() => setCommanderModalOpen(true)}
                    onTap={() => {
                      /* registerTap?.() if available */
                    }}
                    className="bg-transparent"
                  />
                </div>
              </section>

              {/* Main content below tap area */}
              <section className="px-4 md:px-6 lg:px-8">{children}</section>
            </main>

            <CoreDisplay />
            <LiveDashboard />
            <BottomNavBar />
          </div>
        </div>
      </div>

      {/* Commander modal (profile controls - portrait OK here) */}
      {commanderModalOpen && playerProfile && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-lg w-full">
            <Card>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <img src={playerProfile.portraitUrl ?? playerProfile.avatarUrl ?? "/default-avatar.png"} alt="Comandante" className="w-20 h-20 rounded-full object-cover border-2" />
                  <div>
                    <h3 className="text-lg font-semibold">{playerProfile.name}</h3>
                    <p className="text-sm text-muted-foreground">Level {playerProfile.level} • {playerProfile.rankTitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card/40 p-3 rounded-md text-center">
                    <div className="text-xs text-muted-foreground">Points</div>
                    <div className="text-lg font-bold">{playerProfile.points.toLocaleString()}</div>
                  </div>
                  <div className="bg-card/40 p-3 rounded-md text-center">
                    <div className="text-xs text-muted-foreground">Auron</div>
                    <div className="text-lg font-bold">{playerProfile.auron?.toLocaleString() ?? 0}</div>
                  </div>
                  <div className="bg-card/40 p-3 rounded-md text-center">
                    <div className="text-xs text-muted-foreground">Taps</div>
                    <div className="text-lg font-bold">{playerProfile.currentTaps}/{playerProfile.maxTaps}</div>
                  </div>
                  <div className="bg-card/40 p-3 rounded-md text-center">
                    <div className="text-xs text-muted-foreground">Battle Pass</div>
                    <div className="text-lg font-bold">Lv {playerProfile.battlePassLevel}</div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCommanderModalOpen(false)}>Close</Button>
                  <Button onClick={() => { setCommanderModalOpen(false); }}>Manage</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default AppLayout;