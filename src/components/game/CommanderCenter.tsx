import React, { ReactNode, useRef, useLayoutEffect, useCallback, useState } from "react";

type ButtonItem = { id: string; label: string; onClick?: () => void; icon?: React.ReactNode; };

type Props = {
  fullBodyUrl?: string;
  avatarUrl?: string;
  showHalo?: boolean;
  onAvatarClick?: () => void;
  onTap?: (ev?: React.MouseEvent | React.TouchEvent) => void | Promise<void>;
  bottomButtons?: ButtonItem[];
  rightButtons?: ButtonItem[];
  className?: string;
  rightOffset?: string;
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  handLeftX?: number;
  handRightX?: number;
  handY?: number;
};

const CommanderCenter: React.FC<Props> = ({
  fullBodyUrl,
  avatarUrl,
  showHalo = false,
  onTap,
  bottomButtons,
  rightButtons,
  className = "",
  rightOffset = "1.5rem",
  leftPanel,
  rightPanel,
  handLeftX = 0.18,
  handRightX = 0.82,
  handY = 0.62,
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [leftPos, setLeftPos] = useState<{ top: number; left: number } | null>(null);
  const [rightPos, setRightPos] = useState<{ top: number; left: number } | null>(null);
  const [tapPulse, setTapPulse] = useState(false);

  const bottomDefault: ButtonItem[] = [
    { id: "missions", label: "Missions" },
    { id: "rewards", label: "Rewards" },
    { id: "community", label: "Community" },
    { id: "alliance", label: "Alliance" },
  ];
  const rightDefault: ButtonItem[] = [
    { id: "ark", label: "Ark-Forge" },
    { id: "change", label: "Change" },
    { id: "invite", label: "Invite" },
  ];
  const bottom = bottomButtons ?? bottomDefault;
  const right = rightButtons ?? rightDefault;
  const imgSrc = fullBodyUrl ?? avatarUrl ?? "/images/commander-placeholder-full.png";

  const computeHandPositions = useCallback(() => {
    const wrapper = wrapperRef.current;
    const img = imgRef.current;
    if (!wrapper || !img) return;
    const wrapRect = wrapper.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    const imgLeft = imgRect.left - wrapRect.left;
    const imgTop = imgRect.top - wrapRect.top;
    const leftX = imgLeft + imgRect.width * handLeftX;
    const rightX = imgLeft + imgRect.width * handRightX;
    const y = imgTop + imgRect.height * handY;
    setLeftPos({ left: leftX, top: y });
    setRightPos({ left: rightX, top: y });
  }, [handLeftX, handRightX, handY]);

  useLayoutEffect(() => {
    computeHandPositions();
    const onResize = () => computeHandPositions();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [computeHandPositions]);

  const handleTap = async (ev?: React.MouseEvent | React.TouchEvent) => {
    setTapPulse(true);
    window.setTimeout(() => setTapPulse(false), 130);
    await Promise.resolve(onTap?.(ev));
  };

  return (
    // wrapper has lower z than header (header z-90 in layout). Keep wrapper z lower so header never shows commander.
    <div ref={wrapperRef} className={`commander-center relative z-10 w-full min-h-[50vh] flex items-center justify-center ${className}`}>
      {showHalo && (
        <div aria-hidden className="absolute -z-10 w-[520px] h-[520px] rounded-full bg-[rgba(255,255,255,0.03)] blur-[6px]" style={{ transform: "translateY(8%)" }} />
      )}

      <div className={`relative flex flex-col items-center ${tapPulse ? "scale-[0.98]" : ""} transition-transform duration-150`}>
        <img
          ref={imgRef}
          src={imgSrc}
          alt="Commander full body"
          className="w-auto max-h-[68vh] object-contain object-bottom pointer-events-none"
          draggable={false}
          onLoad={() => computeHandPositions()}
        />

        <button
          type="button"
          aria-label="Tap commander"
          onClick={handleTap}
          className="absolute inset-0 w-full h-full bg-transparent border-0 p-0 m-0"
          style={{ pointerEvents: "auto" }}
        />

        <div className="mt-2 -translate-y-1">
          <div className="inline-flex items-center gap-2 bg-black/40 border border-white/5 rounded-full p-1 px-3 shadow-md">
            {bottom.map((b) => (
              <button
                key={b.id}
                onClick={() => b.onClick?.()}
                className="px-4 py-2 rounded-full text-sm md:text-base bg-black/10 hover:bg-black/20"
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* anchored left panel: lower z than header but above background */}
      {leftPanel && leftPos && (
        <div
          className="absolute z-20 pointer-events-auto"
          style={{
            left: leftPos.left,
            top: leftPos.top,
            transform: "translate(-50%, -20%)",
          }}
        >
          {leftPanel}
        </div>
      )}

      {/* anchored right panel */}
      {rightPanel && rightPos && (
        <div
          className="absolute z-20 pointer-events-auto"
          style={{
            left: rightPos.left,
            top: rightPos.top,
            transform: "translate(-50%, -20%)",
          }}
        >
          {rightPanel}
        </div>
      )}

      {/* fallback right column (if rightPanel not provided) */}
      {!rightPanel && (
        <div className="hidden md:block absolute top-1/3 transform -translate-y-1/3 z-20 pointer-events-auto" style={{ right: rightOffset }}>
          <div className="flex flex-col gap-2 bg-black/60 border border-white/5 rounded-xl p-2 shadow-lg w-[140px]">
            {right.map((b) => (
              <button key={b.id} onClick={() => b.onClick?.()} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/2">
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommanderCenter;