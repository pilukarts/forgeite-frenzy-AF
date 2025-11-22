import React from "react";

const RightSideButtons: React.FC<{ className?: string }> = ({ className = "" }) => {
  const options = ["Missions", "Rewards", "Community", "Alliance", "Change", "Invite"];
  return (
    <div className={`flex flex-col gap-2 bg-[rgba(6,7,20,0.92)] border border-[rgba(255,255,255,0.04)] rounded-xl p-2 shadow-lg w-[140px] ${className}`}>
      {options.map((label) => (
        <button key={label} className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/95 hover:bg-[rgba(255,255,255,0.03)] transition">
          {label}
        </button>
      ))}
    </div>
  );
};

export default RightSideButtons;