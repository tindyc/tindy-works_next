import { motion } from 'framer-motion';
import { WeatherCanvas } from '../components/WeatherCanvas';
import { DigitalPlant } from '../components/DigitalPlant';
import { WeatherData } from '../hooks/useWeather';

interface MockPlant {
  growth: number;
  leafCount: number;
  isWilted: boolean;
  harvestReady: boolean;
  status: 'DORMANT' | 'OPTIMAL' | 'WILTED';
  hydration: number;
}

interface Scenario {
  label: string;
  plant: MockPlant;
  weather: WeatherData;
  isDay: boolean;
}


const scenarios: Scenario[] = [
  {
    label: 'SEED / CLEAR DAY',
    plant: { growth: 0, leafCount: 0, isWilted: false, harvestReady: false, status: 'DORMANT', hydration: 100 },
    weather: { condition: 'CLEAR', temp: 18, description: 'CLEAR SKY', humidity: 50, windSpeed: 10 },
    isDay: true,
  },
  {
    label: 'EARLY / CLOUDY',
    plant: { growth: 20, leafCount: 1, isWilted: false, harvestReady: false, status: 'OPTIMAL', hydration: 80 },
    weather: { condition: 'CLOUDY', temp: 14, description: 'CLOUDY', humidity: 60, windSpeed: 12 },
    isDay: true,
  },
  {
    label: 'GROWING / RAIN',
    plant: { growth: 50, leafCount: 3, isWilted: false, harvestReady: false, status: 'OPTIMAL', hydration: 90 },
    weather: { condition: 'RAIN', temp: 12, description: 'LIGHT RAIN', humidity: 80, windSpeed: 8 },
    isDay: true,
  },
  {
    label: 'THRIVING / SUNNY',
    plant: { growth: 80, leafCount: 4, isWilted: false, harvestReady: false, status: 'OPTIMAL', hydration: 85 },
    weather: { condition: 'CLEAR', temp: 22, description: 'CLEAR SKY', humidity: 50, windSpeed: 6 },
    isDay: true,
  },
  {
    label: 'WILTED / DRY',
    plant: { growth: 60, leafCount: 3, isWilted: true, harvestReady: false, status: 'WILTED', hydration: 10 },
    weather: { condition: 'CLEAR', temp: 25, description: 'CLEAR SKY', humidity: 20, windSpeed: 15 },
    isDay: true,
  },
  {
    label: 'HARVEST READY',
    plant: { growth: 100, leafCount: 5, isWilted: false, harvestReady: true, status: 'OPTIMAL', hydration: 90 },
    weather: { condition: 'CLEAR', temp: 19, description: 'CLEAR SKY', humidity: 60, windSpeed: 9 },
    isDay: true,
  },
  {
    label: 'NIGHT / REST',
    plant: { growth: 40, leafCount: 2, isWilted: false, harvestReady: false, status: 'OPTIMAL', hydration: 70 },
    weather: { condition: 'CLEAR', temp: 10, description: 'CLEAR SKY', humidity: 50, windSpeed: 5 },
    isDay: false,
  },
];

const timeline = [
  { day: 'Day 1', growth: 10, hydration: 100 },
  { day: 'Day 2', growth: 25, hydration: 90 },
  { day: 'Day 3', growth: 45, hydration: 80 },
  { day: 'Day 4', growth: 65, hydration: 70 },
  { day: 'Day 5', growth: 85, hydration: 65 },
  { day: 'Day 6', growth: 100, hydration: 60, harvestReady: true },
];

const neglect = [
  { label: 'Day 1', hydration: 80, isWilted: false },
  { label: 'Day 2', hydration: 60, isWilted: false },
  { label: 'Day 3', hydration: 35, isWilted: false },
  { label: 'Day 4', hydration: 20, isWilted: true },
  { label: 'Day 5', hydration: 10, isWilted: true },
];

const rules = [
  { label: 'Growth', lines: ['+15 per watering', 'Weather adjusts slightly'] },
  { label: 'Hydration', lines: ['Decreases over time', '<30% = wilted'] },
  { label: 'Passive', lines: ['+2 every ~12h', 'Only after inactivity'] },
  { label: 'Harvest', lines: ['100% growth', 'Resets cycle'] },
];

const SMOOTH_STEPS = 3; // intermediate cards between each keyframe

function interpolate(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

const interpolatedTimeline = (() => {
  const result: { day: string; growth: number; hydration: number; harvestReady?: boolean }[] = [];
  for (let i = 0; i < timeline.length - 1; i++) {
    const a = timeline[i];
    const b = timeline[i + 1];
    for (let s = 0; s < SMOOTH_STEPS; s++) {
      const t = s / SMOOTH_STEPS;
      result.push({
        day: s === 0 ? a.day : '',
        growth: interpolate(a.growth, b.growth, t),
        hydration: interpolate(a.hydration, b.hydration, t),
        harvestReady: false,
      });
    }
  }
  const last = timeline[timeline.length - 1];
  result.push({ day: last.day, growth: last.growth, hydration: last.hydration, harvestReady: last.harvestReady });
  return result;
})();

export function PlantLab() {
  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-88px)] mt-[64px] md:mt-[88px]">
      <header className="w-full max-w-[1440px] mx-auto border-x border-b border-[var(--border-subtle)] px-6 md:px-12 py-8 md:py-10 bg-[var(--bg-base)]">
        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tighter uppercase text-[var(--text-primary)]">
          Plant Lab
        </h1>
        <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)] mt-3">
          System preview — all states
        </p>
      </header>

      <main className="flex-grow w-full max-w-[1440px] mx-auto border-x border-b border-[var(--border-subtle)] bg-[var(--bg-base)] px-6 md:px-12 py-10 md:py-16">

        {/* Part 1 — System Logic */}
        <div className="mb-16 max-w-2xl space-y-6">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60">
            System Logic
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed opacity-80">
            The plant grows through consistent care. Each watering increases growth,
            while time reduces hydration.
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed opacity-80">
            If hydration becomes too low, the plant enters a wilted state.
            Recovery is possible with attention.
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed opacity-80">
            Even without interaction, the plant continues to grow slowly over time.
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed opacity-80">
            At full growth, the plant becomes ready to harvest. Harvesting resets the cycle.
          </p>
        </div>

        {/* Part 2 — Rule Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10 mb-20">
          {rules.map(({ label, lines }) => (
            <div key={label} className="border-t border-[var(--border-subtle)] pt-4 space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-secondary)] opacity-60">
                {label}
              </p>
              {lines.map((line) => (
                <p key={line} className="text-xs text-[var(--text-secondary)] opacity-70 leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>

        {/* Part 3 — Growth Timeline */}
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60 mt-20 mb-6">
          Growth Timeline
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-4 items-start">
          {interpolatedTimeline.map(({ day, growth, hydration, harvestReady }, i) => (
            <motion.div
              key={i}
              className="w-[140px] h-[340px] border border-[var(--border-subtle)] flex flex-col shrink-0"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <div className="h-10 shrink-0 px-2 flex items-center border-b border-[var(--border-subtle)]">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] opacity-60">
                  {day}
                </p>
              </div>
              <div className="relative flex-1 overflow-hidden bg-[#f5f5f5]">
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black/10 z-10" />
                <div className="absolute inset-0 overflow-hidden">
                  <div className="w-full h-full">
                    <DigitalPlant
                      context="card"
                      plant={{ growth, leafCount: Math.floor(growth / 20), isWilted: false, harvestReady: harvestReady ?? false, hydration }}
                      strokeClass="stroke-[#111111]"
                    />
                  </div>
                </div>
              </div>
              <div className="h-8 shrink-0 px-2 flex items-center border-t border-[var(--border-subtle)]">
                <p className="font-mono text-[10px] text-[var(--text-muted)]">
                  {growth}%
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Part 4 — Neglect Simulation */}
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60 mt-20 mb-6">
          If You Stop Caring
        </h2>
        <div className="flex gap-6 overflow-x-auto pb-4 items-start">
          {neglect.map(({ label, hydration, isWilted }) => (
            <div key={label} className="w-[200px] h-[380px] border border-[var(--border-subtle)] flex flex-col shrink-0">
              <div className="h-10 shrink-0 px-3 flex items-center border-b border-[var(--border-subtle)]">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] opacity-60">
                  {label}
                </p>
              </div>
              <div className="relative flex-1 overflow-hidden bg-[#f5f5f5]">
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black/10 z-10" />
                <div className="absolute inset-0 overflow-hidden">
                  <div className="w-full h-full">
                    <DigitalPlant
                      context="card"
                      plant={{ growth: Math.max(20, hydration), leafCount: Math.floor(hydration / 20), isWilted, harvestReady: false, hydration }}
                      strokeClass="stroke-[#111111]"
                    />
                  </div>
                </div>
              </div>
              <div className="h-8 shrink-0 px-3 flex items-center border-t border-[var(--border-subtle)]">
                <p className="font-mono text-[10px] text-[var(--text-muted)]">
                  Hydration: {hydration}%
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Part 5 — Scenario Grid */}
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60 mt-20 mb-6">
          All States
        </h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-lg mb-10 opacity-80">
          Each state below shows how the system responds to care, time, and environment.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {scenarios.map((scenario) => (
            <div key={scenario.label} className="border border-[var(--border-subtle)] flex flex-col hover:scale-[1.02] transition-transform duration-200">
              <div className="h-[220px] overflow-hidden">
                <WeatherCanvas
                  context="card"
                  plant={scenario.plant}
                  weather={scenario.weather}
                  isDay={scenario.isDay}
                  previewTime={scenario.isDay ? '12:00' : '23:00'}
                />
              </div>
              <div className="p-3 border-t border-[var(--border-subtle)] flex flex-col gap-1">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] opacity-60">
                  {scenario.label}
                </p>
                <p className="font-mono text-[9px] text-[var(--text-muted)] line-clamp-1">
                  G: {scenario.plant.growth}% / H: {scenario.plant.hydration}% / {scenario.plant.status}
                </p>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
