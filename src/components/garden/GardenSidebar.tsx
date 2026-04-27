import React from 'react';
import { Droplets, CloudRain, Sun, Cloud, Snowflake, Sprout } from 'lucide-react';
import { WeatherData } from '@/hooks/useWeather';
import { usePlant } from '@/hooks/usePlant';
import { PlantStats } from './PlantStats';

type PlantState = ReturnType<typeof usePlant>;

function renderWeatherIcon(weather: WeatherData) {
  switch(weather.condition) {
    case 'RAIN': return <CloudRain className="w-8 h-8" strokeWidth={1} />;
    case 'CLEAR': return <Sun className="w-8 h-8" strokeWidth={1} />;
    case 'CLOUDY': return <Cloud className="w-8 h-8" strokeWidth={1} />;
    case 'SNOW': return <Snowflake className="w-8 h-8" strokeWidth={1} />;
    default: return <Sun className="w-8 h-8" strokeWidth={1} />;
  }
}

export function GardenSidebar({ plant, weather }: { plant: PlantState, weather: WeatherData | null }) {
  const isRaining = weather?.condition === 'RAIN';

  const formatTime = (ms: number) => {
    if (ms <= 0) return 'READY';
    const totalMins = Math.floor(ms / 60000);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h.toString().padStart(2, '0')}H ${m.toString().padStart(2, '0')}M`;
  };

  return (
    <aside className="w-full md:w-[380px] flex-shrink-0 border-b md:border-b-0 md:border-r border-[var(--border-subtle)] flex flex-col justify-between p-8 md:p-12 bg-[var(--bg-base)] relative z-20">
      <div className="space-y-12">
        <PlantStats plant={plant} />

        <div className="pt-8 space-y-3">
          {plant.harvestReady ? (
            <button
              type="button"
              onClick={plant.harvestPlant}
              className="w-full py-4 px-6 font-sans text-xs font-semibold uppercase tracking-widest border border-[var(--text-primary)] transition-all duration-300 flex justify-center items-center space-x-2 group bg-[var(--text-primary)] text-[var(--bg-base)] hover:bg-transparent hover:text-[var(--text-primary)] cursor-pointer"
            >
              <Sprout className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>HARVEST</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => plant.waterPlant(weather ?? undefined)}
                disabled={!plant.canWater || isRaining}
                className={`w-full py-4 px-6 font-sans text-xs font-semibold uppercase tracking-widest border border-[var(--text-primary)] transition-all duration-300 flex justify-center items-center space-x-2 group ${isRaining ? 'opacity-40 cursor-not-allowed text-[var(--text-muted)] bg-transparent border-[var(--border-subtle)]' : plant.canWater ? 'bg-[var(--text-primary)] text-[var(--bg-base)] hover:bg-transparent hover:text-[var(--text-primary)] cursor-pointer' : 'text-[var(--text-muted)] cursor-not-allowed bg-transparent'}`}
              >
                <Droplets className={`w-4 h-4 ${plant.canWater && !isRaining ? 'group-hover:scale-110 transition-transform' : ''}`} />
                <span>{isRaining ? 'RAINING' : 'WATER PLANT'}</span>
              </button>
              {isRaining && (
                <p className="font-mono text-[10px] tracking-[0.12em] text-[var(--text-muted)] text-center">
                  The rain is already taking care of your plant.
                </p>
              )}
            </>
          )}
          <p className="font-sans text-xs font-semibold tracking-widest text-[var(--text-muted)] uppercase text-center">
            {plant.harvestReady ? 'READY TO HARVEST' : `NEXT CYCLE: ${formatTime(plant.timeToNextMs)}`}
          </p>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-[var(--border-subtle)] space-y-6">
        <p className="font-sans text-xs font-semibold tracking-widest text-[var(--text-muted)] uppercase">ENVIRONMENT</p>
        
        {weather ? (
          <div className="flex items-start space-x-4">
            <div className="text-[var(--text-primary)]">{renderWeatherIcon(weather)}</div>
            <div>
              <p className="font-sans text-xs font-semibold tracking-widest text-[var(--text-primary)] mb-1 uppercase">{weather.description}</p>
              <p className="text-sm text-[var(--text-muted)]">LONDON, UK</p>
              <div className="flex space-x-4 mt-2 font-sans text-xs font-semibold tracking-widest text-[var(--text-muted)] uppercase">
                <span>{weather.temp}°C</span>
                <span>{weather.humidity}% HUM</span>
                <span>{weather.windSpeed} KM/H W</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-pulse flex items-start space-x-4">
            <div className="w-8 h-8 bg-[var(--border-subtle)] rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="w-24 h-4 bg-[var(--border-subtle)] rounded"></div>
              <div className="w-32 h-3 bg-[var(--border-subtle)] rounded"></div>
            </div>
          </div>
        )}
        
        <p className="font-sans text-[10px] font-semibold tracking-widest text-[var(--text-muted)] pt-8 uppercase">DATA PERSISTS LOCALLY</p>
      </div>
    </aside>
  );
}
