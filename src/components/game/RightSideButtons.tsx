
import React from "react";
import Link from 'next/link';
import { Button } from '../ui/button';

type ButtonLink = {
    id: string;
    label: string;
    href: string;
};

const RightSideButtons: React.FC<{ className?: string }> = ({ className = "" }) => {
  const options: ButtonLink[] = [
      { id: 'missions', label: 'Missions', href: '/quests' },
      { id: 'rewards', label: 'Rewards', href: '/battle-pass' },
      { id: 'community', label: 'Community', href: '/community' },
      { id: 'alliance', label: 'Alliance', href: '/alliance-chat' },
  ];

  return (
    <div className={`flex flex-col gap-2 bg-[rgba(6,7,20,0.92)] border border-[rgba(255,255,255,0.04)] rounded-xl p-2 shadow-lg w-[140px] ${className}`}>
      {options.map((item) => (
        <Button key={item.id} asChild variant="ghost" className="w-full justify-start text-sm text-white/95 hover:bg-[rgba(255,255,255,0.03)]">
            <Link href={item.href}>
                {item.label}
            </Link>
        </Button>
      ))}
    </div>
  );
};

export default RightSideButtons;
