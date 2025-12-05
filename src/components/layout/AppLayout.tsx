"use client";
import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNavBar from "@/components/navigation/BottomNavBar";
import ResourceDisplay from "@/components/game/ResourceDisplay";
import { Button } from "@/components/ui/button";
import { useGame } from "@/contexts/GameContext";
import { CreditCard, Zap } from "lucide-react";
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
import PlayerProfileHeader from "@/components/player/PlayerProfileHeader";
import HolographicMenu from "@/components/game/HolographicMenu";

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
  const router = useRouter();

  // selected holographic option (optional)
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);

  // Defensive: remove any commander nodes from header and observe for remounts
  useEffect(() => {
    if (typeof window === "undefined") return;

    const removeCommanderInHeader = () => {
      document.querySelectorAll('header .commander-center, header img[src*="commander"], header [data-component="CommanderCenter"]').forEach((el) => {
        try {
          el.remove();
        } catch {
          // fallback: hide and neutralize
          (el as HTMLElement).style.display = "none";
          if ((el as HTMLImageElement).removeAttribute) (el as HTMLImageElement).removeAttribute("src");
        }
      });
    };

    removeCommanderInHeader();

    const header = document.querySelector("header");
    if (!header) return;
    const mo = new MutationObserver(() => removeCommanderInHeader());
    mo.observe(header, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    if (!playerProfile) setSelectedMenu(null);
  }, [playerProfile]);

  if (isLoading) return <IntroScreen />;
  if (!isInitialSetupDone) return <PlayerSetup />;
  if (!playerProfile) return <IntroScreen />;

  const seasonProgress = playerProfile?.seasonProgress?.[currentSeason.id] ?? 0;

  // holographic options for left/right
  const leftOptions = ["Missions", "Rewards"];
  const rightOptions = ["Community", "Alliance"];

  const handleHoloSelect = (option: string) => {
    setSelectedMenu(option);
    // navigate to relevant page (adjust routes as needed)
    switch (option) {
      case "Missions":
        router.push("/missions");
        break;
      case "Rewards":
        router.push("/rewards");
        break;
      case "Community":
        router.push("/community");
        break;
      case "Alliance":
        router.push("/alliance");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white items-center">
        <div className="relative flex w-full h-full max-w-7xl mx-auto bg-gray-900/95 shadow-2xl overflow-hidden md:h-screen">
          <SidebarNav />

          <div className="flex flex-col flex-grow min-h-screen">
            {/* HEADER: Player info, resources, wallet connection */}
            <header className="sticky top-0 z-[2000] h-20 p-2 bg-gray-800/95 backdrop-blur-md shadow-sm border-b border-gray-700/50">
              <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto w-full">
                {/* Left: Player Profile Header - no commander image here */}
                <div className="flex items-center gap-4 w-1/3">
                  <PlayerProfileHeader profile={playerProfile} compact />
                </div>

                {/* Center: Tap status */}
                <div className="flex-1 flex items-center justify-center">
                  <TapStatusCard />
                </div>

                {/* Right: Resources and Wallet */}
                <div className="flex items-center justify-end gap-3 w-1/3">
                  <ResourceDisplay seasonResourceAmount={seasonProgress} auronCount={playerProfile.auron ?? 0} />
                  <ConnectButton.Custom>
                    {({ account, chain, openAccountModal, openConnectModal, mounted, authenticationStatus }) => {
                      const ready = mounted && authenticationStatus !== "loading";
                      const connected = ready && account && chain;
                      useEffect(() => {
                        if (connected && account?.address && !playerProfile.isWalletConnected) {
                          connectWallet(account.address);
                        }
                      }, [connected, account?.address, connectWallet, playerProfile.isWalletConnected]);

                      return (
                        <div>
                          {!connected ? (
                            <Button onClick={openConnectModal} variant="outline" size="sm">
                              Connect
                            </Button>
                          ) : (
                            <div className="flex gap-2 items-center">
                              <Button onClick={openAccountModal} variant="outline" size="sm">
                                {account.displayName}
                              </Button>
                              <Button asChild variant="outline" size="sm">
                                <Link href="/marketplace">
                                  <CreditCard className="mr-2" />
                                  Buy
                                </Link>
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    }}
                  </ConnectButton.Custom>
                </div>
              </div>
            </header>

            {/* MAIN: Renders the page content (tap area contains the commander centered and holographic menus) */}
            <main className="flex-grow overflow-y-auto pb-14 flex flex-col pt-20">
              {/* TAP AREA: window background + CommanderCenter (ONLY here) */}
              <section id="tap-area" className="w-full mt-0">
                <div
                  className="w-full max-w-7xl mx-auto relative flex items-center justify-center"
                  style={{
                    minHeight: "62vh",
                    backgroundImage: "url('/images/window-bg.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center top",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  <CommanderCenter
                    fullBodyUrl={
                      playerProfile.avatarUrl ??
                      (playerProfile.commanderSex === "female" ? "/images/commander-woman-full.png" : "/images/commander-man-full.png")
                    }
                    showHalo={true}
                    leftPanel={
                      <ArkForgePanel
                        countdown={"03:12:45"}
                        imageUrl={playerProfile.avatarUrl ?? playerProfile.portraitUrl ?? "/images/ark-ship-small.png"}
                        alt="Player avatar"
                      />
                    }
                    rightPanel={<HolographicMenu options={rightOptions} side="right" selected={selectedMenu} onSelect={handleHoloSelect} />}
                    handLeftX={0.16}
                    handRightX={0.84}
                    handY={0.62}
                    className="bg-transparent"
                    onTap={() => {
                      /* optional registerTap?.() */
                    }}
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
    </>
  );
};

export default AppLayout;