import React, { useState } from "react";
import images from "@/lib/placeholder-images.json";

type Props = {
  countdown?: string;
  className?: string;
  imageUrl?: string;
  alt?: string;
};

const DEFAULT_SRC = "/images/ark-ship-small.png";

const ArkForgePanel: React.FC<Props> = ({ countdown = "03:12:45", className = "", imageUrl, alt = "Ark" }) => {
  const initialSrc = imageUrl ?? images?.ark?.ark ?? DEFAULT_SRC;
  const [src, setSrc] = useState<string>(initialSrc);

  return (
    <div className={`w-44 rounded-xl p-3 bg-[rgba(6,7,20,0.92)] border border-[rgba(255,255,255,0.04)] shadow-lg ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-[rgba(255,255,255,0.02)] rounded-md flex items-center justify-center overflow-hidden">
          <img
            src={src}
            alt={alt}
            className="w-12 h-12 object-cover rounded-md"
            loading="lazy"
            onError={() => {
              if (src !== DEFAULT_SRC) setSrc(DEFAULT_SRC);
            }}
            draggable={false}
          />
        </div>

        <div className="flex-1">
          <div className="text-xs text-gray-300">Ark Forge</div>
          <div className="font-mono font-semibold text-yellow-300 text-sm">{countdown}</div>
        </div>
      </div>
    </div>
  );
};

export default ArkForgePanel;