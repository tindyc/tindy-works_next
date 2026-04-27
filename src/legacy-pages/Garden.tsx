"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { WeatherCanvas } from '../components/WeatherCanvas';
import { Tips } from '../components/Tips';
import { PlantIntro } from '../components/PlantIntro';
import { PlantCarousel } from '../components/PlantCarousel';
import { usePlant } from '../hooks/usePlant';
import { useWeather } from '../hooks/useWeather';

export function Garden() {
  const plant = usePlant();
  const weather = useWeather();
  const [isDay, setIsDay] = useState(true);
  const navigate = useNavigate();
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
          onClick={() => navigate('/plant-lab')}
          type="button"
          className="ui-button absolute top-8 right-6 md:top-10 md:right-12 text-[10px] font-mono uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span>Plant Lab</span>
        </button>
      </header>

      <main className="flex-grow w-full max-w-[1440px] mx-auto border-x border-[var(--border-subtle)] flex flex-col md:flex-row border-b border-[var(--border-subtle)]">
        <Sidebar plant={plant} weather={weather} />
        <WeatherCanvas plant={plant} weather={weather} isDay={isDay} />
      </main>
      
      {/* Plant Features: Side by side on Desktop, swappable on Mobile */}
      <div id="plant-section" className="w-full max-w-[1440px] mx-auto border-x border-[var(--border-subtle)] flex flex-col md:flex-row items-stretch bg-[var(--bg-base)] overflow-hidden relative shadow-[0_10px_30px_var(--shadow-base)]">
        <div className={`w-full md:w-[380px] flex-shrink-0 flex items-center justify-center border-r border-[var(--border-subtle)] transition-opacity duration-700 min-h-[calc(100dvh-64px)] md:min-h-[70vh] lg:min-h-[80vh] ${showCarouselMobile ? 'hidden md:flex' : 'flex'}`}>
           <PlantIntro onExploreClick={() => setShowCarouselMobile(true)} />
        </div>
        <div className={`w-full md:w-auto md:flex-1 min-w-0 relative bg-[var(--bg-base)] transition-opacity duration-700 flex flex-col min-h-[calc(100dvh-64px)] md:min-h-[70vh] lg:min-h-[80vh] border-t md:border-t-0 md:border-l border-[var(--border-subtle)] ${!showCarouselMobile ? 'hidden md:flex' : 'flex'}`}>
          {showCarouselMobile && (
            <button 
              onClick={() => setShowCarouselMobile(false)}
              className="ui-button absolute top-6 left-6 z-50 md:hidden bg-[var(--overlay-bg)] text-xs font-mono tracking-widest uppercase backdrop-blur-md shadow-[0_4px_20px_var(--shadow-base)]"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back
            </button>
          )}
          <PlantCarousel />
        </div>
      </div>

      <div className="w-full max-w-[1440px] mx-auto border-x border-t border-[var(--border-subtle)] shadow-[0_10px_30px_var(--shadow-base)]">
        <Tips />
      </div>

    </div>
  );
}
