import React from "react";
import HolographicButton from "./HolographicButton";
import { useRouter } from "next/navigation";

type Props = {
  options: string[];
  side?: "left" | "right";
  className?: string;
  selected?: string | null;
  onSelect?: (option: string) => void;
  alignOffset?: number; // optional horizontal offset in px
};

const HolographicMenu: React.FC<Props> = ({ options, side = "right", className = "", selected = null, onSelect, alignOffset = 0 }) => {
  const router = useRouter();

  const handleSelect = (option: string) => {
    if (onSelect) {
      onSelect(option);
    }
  };

  const horizontalTransform = side === "left" ? "translate(-50%, -20%)" : "translate(-50%, -20%)";
  return (
    <div
      className={`flex flex-col gap-3 items-${side === "left" ? "end" : "start"} ${className}`}
      style={{
        transform: undefined,
      }}
    >
      <div
        aria-hidden
        className="absolute -z-10 rounded-xl"
        style={{
          width: 160,
          height: options.length * 48 + 24,
          background: "linear-gradient(180deg, rgba(10,12,20,0.6), rgba(10,12,20,0.45))",
          border: "1px solid rgba(255,255,255,0.04)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
          backdropFilter: "blur(6px)",
          transform: horizontalTransform,
        }}
      />
      {options.map((opt) => (
        <div key={opt} className="relative">
          <HolographicButton
            label={opt}
            active={selected === opt}
            onClick={() => handleSelect(opt)}
            className=""
            ariaLabel={opt}
          />
        </div>
      ))}
    </div>
  );
};

export default HolographicMenu;
