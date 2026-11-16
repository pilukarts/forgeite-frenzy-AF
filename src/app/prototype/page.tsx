"use client";

import { useEffect, useRef, useState } from "react";

const DURATION = 45;
const beats = [
  { at: 0, title: "EL VIAJE", detail: "La humanidad busca un nuevo hogar." },
  { at: 6, title: "SEÑAL DESCONOCIDA", detail: "Los sensores reciben una frecuencia sin origen." },
  { at: 12, title: "LA FRACTURA", detail: "Una energía imposible atraviesa el Ark-Forge." },
  { at: 18, title: "EXPLOSIONES SECUNDARIAS", detail: "Los módulos comienzan a desprenderse." },
  { at: 25, title: "LA DISPERSIÓN", detail: "Los fragmentos desaparecen entre sistemas estelares." },
  { at: 32, title: "NÚCLEO SUPERVIVIENTE", detail: "Se restablece la energía de emergencia." },
  { at: 38, title: "MISIÓN 001", detail: "Localiza la primera pieza del Ark-Forge." },
];

export default function ProloguePrototype() {
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [planet, setPlanet] = useState<string | null>(null);
  const last = useRef<number | null>(null);
  useEffect(() => {
    if (!playing || finished) return;
    let raf = 0;
    const tick = (now: number) => {
      if (last.current !== null) {
        setSeconds(value => {
          const next = Math.min(DURATION, value + (now - last.current!) / 1000);
          if (next >= DURATION) { setPlaying(false); setFinished(true); }
          return next;
        });
      }
      last.current = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); last.current = null; };
  }, [playing, finished]);

  const scene = beats.reduce((index, beat, i) => seconds >= beat.at ? i : index, 0);
  const fractured = scene >= 2;
  const scattered = scene >= 4;
  const reset = () => { setSeconds(0); setPlaying(false); setFinished(false); setPlanet(null); };
  const skip = () => { setSeconds(DURATION); setPlaying(false); setFinished(true); };
  const fragments = Array.from({ length: 6 }, (_, i) => i);
  return (
    <main className="min-h-screen bg-[#070f20] text-slate-100 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div><p className="text-xs tracking-[.3em] text-cyan-300">FORGEITE FRENZY · PROTOTIPO 01</p><h1 className="text-3xl font-bold">La Última Señal</h1></div>
          <span className="text-xs rounded border border-cyan-500/50 px-3 py-2 text-cyan-200">Historia experimental · no canon definitivo</span>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-cyan-800/70 bg-[#08162c] h-[min(60vw,430px)] min-h-[280px]" aria-label="Animación conceptual del Ark-Forge">
          <div className="absolute inset-0 opacity-70" style={{backgroundImage:"radial-gradient(2px 2px at 12% 22%, white 90%, transparent),radial-gradient(2px 2px at 78% 14%, #9ddcff 90%, transparent),radial-gradient(2px 2px at 56% 73%, white 90%, transparent),radial-gradient(2px 2px at 88% 82%, white 90%, transparent),radial-gradient(2px 2px at 28% 88%, #a7c6ff 90%, transparent)"}}/>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(35,114,175,.26),transparent_65%)]" />
          {scene >= 1 && scene < 6 && <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(139,82,255,.18),transparent_65%)] animate-pulse" />}
          {scene >= 3 && scene <= 4 && <div className="absolute left-1/2 top-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/40 blur-3xl animate-pulse" />}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-52 h-52 sm:w-72 sm:h-72" style={{transform:scattered?"scale(.8)":"scale(1)",transition:"transform 2s"}}>
              <div className="absolute left-1/2 top-1/2 w-20 h-20 sm:w-24 sm:h-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-cyan-300 bg-slate-800 shadow-[0_0_35px_#28c9f5] flex items-center justify-center"><span className="font-bold text-xs text-center">ARK<br/>FORGE</span></div>
              {fragments.map(i => {
                const angle = i * 60;
                const distance = scattered ? 200 : fractured ? 115 : 85;
                return <div key={i} className="absolute left-1/2 top-1/2 w-14 h-8 sm:w-20 sm:h-10 -ml-7 -mt-4 sm:-ml-10 sm:-mt-5 rounded-md border border-cyan-300/80 bg-gradient-to-r from-slate-700 to-slate-950 shadow-[0_0_16px_#0aa9dd]" style={{transform:`rotate(${angle}deg) translateX(${distance}px) rotate(${fractured ? 18 : 0}deg)`,opacity:scattered?.55:1,transition:"transform 3s ease-out, opacity 2s"}}><div className={`absolute right-1 top-1 w-2 h-2 rounded-full ${scene>=3?"bg-orange-400":"bg-cyan-300"}`}/></div>;
              })}
            </div>
          </div>
          <div className="absolute top-4 left-4 right-4 flex justify-between text-xs tracking-widest text-cyan-200"><span>ARK-FORGE / REGISTRO DE VUELO</span><span>{String(Math.floor(seconds)).padStart(2,"0")} / 45 s</span></div>
          <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-slate-950/75 p-4 border border-slate-700/70"><h2 className="font-bold tracking-widest text-orange-200">{beats[scene].title}</h2><p className="text-sm text-slate-200">{beats[scene].detail}</p></div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-cyan-400 transition-[width] duration-100" style={{width:`${seconds/DURATION*100}%`}}/></div>
        <div className="flex flex-wrap gap-3 mt-4">
          <button className="rounded bg-cyan-600 px-5 py-2 font-semibold hover:bg-cyan-500 disabled:opacity-50" disabled={finished} onClick={()=>setPlaying(v=>!v)}>{playing?"Pausar":"Reproducir"}</button>
          <button className="rounded border border-slate-500 px-5 py-2 hover:bg-slate-800" onClick={reset}>Reiniciar</button>
          <button className="rounded border border-orange-500 px-5 py-2 hover:bg-orange-950" onClick={skip}>Omitir introducción</button>
        </div>
        {finished && <section className="mt-8 rounded-xl border border-cyan-700 bg-slate-900/80 p-6"><h2 className="text-2xl font-bold text-cyan-200">MISIÓN 001 · La primera pieza</h2><p className="mt-2 text-slate-300">El núcleo de mando ha sobrevivido. Elige un destino de exploración. Esta selección es una demostración; todavía no guarda progreso ni inicia combate.</p><div className="grid sm:grid-cols-3 gap-3 mt-5">{["Inferno · Cenizas","Limbo · Ruinas","Paraíso · Aurora"].map(name=><button key={name} onClick={()=>setPlanet(name)} className={`p-4 rounded border text-left ${planet===name?"border-cyan-300 bg-cyan-900/50":"border-slate-600 bg-slate-800 hover:border-cyan-600"}`}>{name}</button>)}</div>{planet && <p className="mt-4 text-cyan-300" role="status">Destino seleccionado: {planet}. Próxima etapa: preparar la expedición.</p>}</section>}
        <p className="mt-6 text-xs text-slate-400">Prototipo visual autónomo. Sin audio, sin persistencia y sin cambios en la página principal.</p>
      </div>
    </main>
  );
}
