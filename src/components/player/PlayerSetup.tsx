
"use client";

import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ChevronRight, User, Flag, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { countries } from '@/lib/countries';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { SELECTABLE_AVATARS } from '@/lib/gameData';
import { useToast } from '@/hooks/use-toast';
import PreIntroScreen from '@/components/intro/PreIntroScreen';

type SetupStep = 'intro' | 'name' | 'appearance' | 'country' | 'confirm';

export default function PlayerSetup() {
  const { completeInitialSetup, isPreIntroDone, completePreIntro } = useGame();
  const { toast } = useToast();

  const [step, setStep] = useState<SetupStep>('intro');
  const [name, setName] = useState('');
  const [commanderSex, setCommanderSex] = useState<'male' | 'female'>('male');
  const [country, setCountry] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length >= 2) {
      setStep('appearance');
    }
  };

  const handleAppearanceSelect = (sex: 'male' | 'female') => {
    setCommanderSex(sex);
    setStep('country');
  };

  const handleCountrySelect = (currentValue: string) => {
    setCountry(currentValue === country ? "" : currentValue);
    setPopoverOpen(false);
    setStep('confirm');
  };
  
  const handleConfirm = () => {
    if (!name.trim() || !commanderSex || !country) {
      toast({
        title: "Incomplete Profile",
        description: "Please make sure you have entered a name, chosen an appearance, and selected a country.",
        variant: "destructive",
      });
      return;
    }
    
    const selectedAvatar = SELECTABLE_AVATARS.find(avatar => avatar.sex === commanderSex);
    
    if (!selectedAvatar) {
        toast({
            title: "Avatar Error",
            description: "Could not find the selected avatar configuration. Please try again.",
            variant: "destructive",
        });
        return;
    }

    completeInitialSetup(name, commanderSex, country, selectedAvatar.portraitUrl, selectedAvatar.fullBodyUrl);
  };
  
  const getStepContent = () => {
    switch (step) {
      case 'intro':
          return <PreIntroScreen onCompletion={() => setStep('name')} />;
      case 'name':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CardHeader>
              <CardTitle className="flex items-center"><User className="mr-2" /> Callsign</CardTitle>
              <CardDescription>Enter your commander callsign.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNameSubmit}>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Commander Nova"
                  className="text-center text-lg h-12 mb-4"
                  autoFocus
                />
                <Button type="submit" className="w-full" disabled={name.trim().length < 2}>
                  Confirm Callsign <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </motion.div>
        );

      case 'appearance':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CardHeader>
              <CardTitle className="flex items-center"><ImageIcon className="mr-2" /> Appearance</CardTitle>
              <CardDescription>Select your commander's appearance.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {SELECTABLE_AVATARS.map(avatar => (
                <div key={avatar.sex} onClick={() => handleAppearanceSelect(avatar.sex)} className="cursor-pointer">
                  <Image
                    src={avatar.portraitUrl}
                    alt={`${avatar.sex} commander`}
                    data-ai-hint={avatar.hint}
                    width={200}
                    height={200}
                    className="rounded-lg border-4 border-transparent hover:border-primary transition-all"
                  />
                   <p className="text-center mt-2 font-semibold capitalize">{avatar.sex}</p>
                </div>
              ))}
            </CardContent>
          </motion.div>
        );

      case 'country':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CardHeader>
              <CardTitle className="flex items-center"><Flag className="mr-2" /> Home Country</CardTitle>
              <CardDescription>Select your country of origin.</CardDescription>
            </CardHeader>
            <CardContent>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-12 text-lg"
                  >
                    {country ? countries.find((c) => c.code === country)?.name : "Select country..."}
                    <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandList>
                        <CommandGroup>
                        {countries.map((c) => (
                            <CommandItem
                            key={c.code}
                            value={c.code}
                            onSelect={handleCountrySelect}
                            >
                            <Check
                                className={cn(
                                "mr-2 h-4 w-4",
                                country === c.code ? "opacity-100" : "opacity-0"
                                )}
                            />
                            {c.name}
                            </CommandItem>
                        ))}
                        </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
          </motion.div>
        );

      case 'confirm':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CardHeader>
              <CardTitle>Confirm Your Profile</CardTitle>
              <CardDescription>Review your details before deployment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Callsign:</span>
                <span className="font-bold">{name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Appearance:</span>
                <span className="font-bold capitalize">{commanderSex}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Country:</span>
                <span className="font-bold">{countries.find(c => c.code === country)?.name}</span>
              </div>
              <Button onClick={handleConfirm} className="w-full mt-4">
                Deploy Commander
              </Button>
            </CardContent>
          </motion.div>
        );
      
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {getStepContent()}
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
}
