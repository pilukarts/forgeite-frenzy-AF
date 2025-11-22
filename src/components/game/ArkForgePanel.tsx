import React from "react";
import images from "@/lib/placeholder-images.json";

type Props = {
  countdown?: string;
  className?: string;
};

const ArkForgePanel: React.FC<Props> = ({ countdown = "03:12:45", className = "" }) => {
  return (
    <div className={`w-40 rounded-xl p-2 bg-[rgba(6,7,20,0.92)] border border-[rgba(255,255,255,0.04)] shadow-lg ${className}`}>
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 bg-[rgba(255,255,255,0.02)] rounded-md flex items-center justify-center overflow-hidden">
          <img src={images.ark.ark} alt="Ark" className="w-10 h-10 object-contain" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">Ark Forge</div>
          <div className="font-mono font-semibold text-yellow-300 text-sm">{countdown}</div>
        </div>
      </div>
    </div>
  );
};

export default ArkForgePanel;
