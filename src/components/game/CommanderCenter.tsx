import React, { useState, useRef, useLayoutEffect, useCallback } from "react";

type ButtonItem = { id: string; label: string; onClick?: () => void; icon?: React.ReactNode; };

type Props = {
  fullBodyUrl?: string;      // must be full-body image for the center
  avatarUrl?: string;        // legacy alias (should also be full-body)
  showHalo?: boolean;        // control halo visibility (in tap area = true)
  onAvatarClick?: () => void;
  onTap?: (ev?: React.MouseEvent | React.TouchEvent) => void | Promise<void>;
  bottomButtons?: ButtonItem[];
  rightButtons?: ButtonItem[];
  className?: string;
  rightOffset?: string;

  // NEW: optional panels anchored to the hands
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;

  // NEW: tuning to anchor panels to hands (fractions 0..1)
  handLeftX?: number;
  handRightX?: number;
  handY?: number;
};

const CommanderCenter: React.FC<Props> = ({
  fullBodyUrl,
  avatarUrl,
  showHalo = false,
  onAvatarClick,
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
  const [rightOpen, setRightOpen] = useState(false);
  const [tapPulse, setTapPulse] = useState(false);
  const tapCooldownRef = useRef(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [leftPos, setLeftPos] = useState<{ top: number; left: number } | null>(null);
  const [rightPos, setRightPos] = useState<{ top: number; left: number } | null>(null);

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

  // Use only full-body image (no portrait fallback here)
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
    if (tapCooldownRef.current) { /* optional throttle */ }
    setTapPulse(true);
    window.setTimeout(() => setTapPulse(false), 130);
    try {
      await Promise.resolve(onTap?.(ev));
    } catch (err) {
      // don't crash UI
      // eslint-disable-next-line no-console
      console.error("onTap error", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTap();
    }
  };

  return (
    <div ref={wrapperRef} className={`commander-center relative w-full min-h-[50vh] md:h-[70vh] lg:h-[72vh] ${className}`}>
      {/* Center block (image + pill bar). showHalo controls halo visibility */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="relative flex flex-col items-center pointer-events-auto">
          {showHalo && (
            <div
              aria-hidden
              className="absolute -z-10 w-[440px] h-[440px] md:w-[540px] md:h-[540px] rounded-full bg-[rgba(255,255,255,0.04)] backdrop-blur-sm border border-[rgba(255,255,255,0.03)] shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
              style={{ transform: "translateY(10%)" }}
            />
          )}

          <div className={`relative flex flex-col items-center ${tapPulse ? "scale-[0.99]" : ""} transition-transform duration-150`}>
            <img
              ref={imgRef}
              src={imgSrc}
              alt="Commander full body"
              className="w-auto max-h-[68vh] object-contain object-bottom pointer-events-none"
              draggable={false}
              onLoad={() => computeHandPositions()}
            />

            {/* overlay that captures all taps over the image rectangle */}
            <button
              type="button"
              aria-label="Tap commander"
              onClick={handleTap}
              onKeyDown={handleKeyDown}
              className="absolute inset-0 w-full h-full bg-transparent border-0 p-0 m-0"
              style={{ pointerEvents: "auto" }}
            />

            {/* Pill bar directly under feet */}
            <div className="mt-2 -translate-y-1">
              <div className="inline-flex items-center gap-2 bg-[rgba(6,7,20,0.56)] border border-[rgba(255,255,255,0.04)] rounded-full p-1 px-3 shadow-md">
                {bottom.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => b.onClick?.()}
                    className="px-4 py-2 rounded-full text-sm md:text-base bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] transition focus:outline-none focus:ring-2 focus:ring-primary/50"
                    aria-label={b.label}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LEFT panel (anchored near left hand) */}
      {leftPanel && leftPos && (
        <div
          className="absolute z-50 pointer-events-auto"
          style={{
            left: leftPos.left,
            top: leftPos.top,
            transform: "translate(-50%, -20%)",
          }}
        >
          {leftPanel}
        </div>
      )}

      {/* RIGHT panel (anchored near right hand) */}
      {rightPanel && rightPos && (
        <div
          className="absolute z-50 pointer-events-auto"
          style={{
            left: rightPos.left,
            top: rightPos.top,
            transform: "translate(-50%, -20%)",
          }}
        >
          {rightPanel}
        </div>
      )}

      {/* Fallback right compact column (if caller prefers simple rightButtons prop) */}
      {!rightPanel && (
        <div
          className="hidden md:block absolute top-1/3 transform -translate-y-1/3 z-50 pointer-events-auto"
          style={{ right: rightOffset }}
        >
          <div className="flex flex-col gap-2 bg-[rgba(6,7,20,0.6)] border border-[rgba(255,255,255,0.04)] backdrop-blur-sm rounded-xl p-2 shadow-lg w-[140px]">
            {right.map((b) => (
              <button
                key={b.id}
                onClick={() => b.onClick?.()}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/95 hover:bg-[rgba(255,255,255,0.03)] transition"
              >
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