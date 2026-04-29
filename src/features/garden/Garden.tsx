"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GardenSidebar } from "@/components/garden/GardenSidebar";
import { WeatherCanvas } from "@/components/garden/WeatherCanvas";
import { Tips } from "@/components/garden/Tips";
import { usePlant } from "@/hooks/usePlant";
import { useWeather } from "@/hooks/useWeather";

export function Garden() {
  const plant = usePlant();
  const weather = useWeather();
  const [isDay, setIsDay] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      setIsDay(hour >= 6 && hour < 18);
    };
    checkTime();
    const timer = setInterval(checkTime, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-88px)] mt-[64px] md:mt-[88px]">
      <header className="relative w-full max-w-[1440px] mx-auto border-x border-b border-[var(--border-subtle)] px-6 md:px-12 py-8 md:py-10 bg-[var(--bg-base)]">
        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tighter uppercase text-[var(--text-primary)]">Garden</h1>
        <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)] mt-3">
          Digital flora system
        </p>
        <button
          onClick={() => router.push("/plant-lab")}
          type="button"
          className="absolute top-8 right-6 md:top-10 md:right-12 flex items-center gap-2 border border-[var(--border-subtle)] px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)] opacity-60 hover:opacity-100 transition"
        >
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span>Plant Lab</span>
        </button>
      </header>

      <main className="flex-grow w-full max-w-[1440px] mx-auto border-x border-[var(--border-subtle)] flex flex-col md:flex-row border-b border-[var(--border-subtle)]">
        <GardenSidebar plant={plant} weather={weather} />
        <WeatherCanvas plant={plant} weather={weather} isDay={isDay} />
      </main>

      <div className="w-full max-w-[1440px] mx-auto border-x border-t border-[var(--border-strong)] shadow-[0_10px_30px_var(--shadow-base)]">
        <Tips />
      </div>
    </div>
  );
}
