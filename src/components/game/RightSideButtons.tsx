import React from "react";

const RightSideButtons: React.FC<{ className?: string }> = ({ className = "" }) => {
  const btn = (label: string) => (
    <button key={label} className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/95 hover:bg-[rgba(255,255,255,0.03)] transition">
      {label}
    </button>
  );

  return (
    <div className={`flex flex-col gap-2 bg-[rgba(6,7,20,0.6)] border border-[rgba(255,255,255,0.04)] rounded-xl p-2 shadow-lg w-[140px] ${className}`}>
      {["Missions", "Rewards", "Community", "Alliance", "Change", "Invite"].map(btn)}
    </div>
  );
};

export default RightSideButtons;