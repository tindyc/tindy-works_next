"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GardenSidebar } from './GardenSidebar';
import { WeatherCanvas } from './WeatherCanvas';
import { Tips } from './Tips';
import { PlantIntro } from './PlantIntro';
import { PlantCarousel } from './PlantCarousel';
import { usePlant } from '@/hooks/usePlant';
import { useWeather } from '@/hooks/useWeather';

export function GardenLayout() {
  const plant = usePlant();
  const weather = useWeather();
  const [isDay, setIsDay] = useState(true);
  const router = useRouter();
  const [showCarouselMobile, setShowCarouselMobile] = useState(false);

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
          onClick={() => router.push('/plant-lab')}
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

      <div id="plant-section" className="w-full max-w-[1440px] mx-auto border-x border-[var(--border-strong)] flex flex-col md:flex-row items-stretch bg-[var(--bg-base)] overflow-hidden relative shadow-[0_10px_30px_var(--shadow-base)]">
        <div className={`w-full md:w-[380px] flex-shrink-0 flex items-center justify-center border-r border-[var(--border-strong)] transition-opacity duration-700 min-h-[calc(100dvh-64px)] md:min-h-[70vh] lg:min-h-[80vh] ${showCarouselMobile ? 'hidden md:flex' : 'flex'}`}>
          <PlantIntro onExploreClick={() => setShowCarouselMobile(true)} />
        </div>
        <div className={`w-full md:w-auto md:flex-1 min-w-0 relative bg-[var(--bg-base)] transition-opacity duration-700 flex flex-col min-h-[calc(100dvh-64px)] md:min-h-[70vh] lg:min-h-[80vh] border-t md:border-t-0 md:border-l border-[var(--border-strong)] ${!showCarouselMobile ? 'hidden md:flex' : 'flex'}`}>
          {showCarouselMobile && (
            <button
              onClick={() => setShowCarouselMobile(false)}
              className="absolute top-6 left-6 z-50 md:hidden flex items-center gap-2 text-[var(--text-primary)] transition-colors text-xs font-mono tracking-widest uppercase bg-[var(--overlay-bg)] backdrop-blur-md px-4 py-2 rounded-full border border-[var(--border-strong)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-base)] shadow-[0_4px_20px_var(--shadow-base)]"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back
            </button>
          )}
          <PlantCarousel />
        </div>
      </div>

      <div className="w-full max-w-[1440px] mx-auto border-x border-t border-[var(--border-strong)] shadow-[0_10px_30px_var(--shadow-base)]">
        <Tips />
      </div>
    </div>
  );
}
