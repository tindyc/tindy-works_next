"use client";

import { useState, useEffect, useRef } from 'react';
import type { WeatherData } from './useWeather';

export type PlantStage = 'seed' | 'small' | 'medium' | 'full';

export const usePlant = () => {
  const [growth, setGrowth] = useState(0);
  const [lastWatered, setLastWatered] = useState<number | null>(null);
  const [harvestReady, setHarvestReady] = useState(false);
  const [lastHarvested, setLastHarvested] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const passiveAnchorRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('tindy_plant_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // backward compat: old saves used petalCount, map it to growth
        setGrowth(parsed.growth ?? (parsed.petalCount ? Math.min(parsed.petalCount * 20, 100) : 0));
        setLastWatered(parsed.lastWatered || null);
        setHarvestReady(parsed.harvestReady ?? false);
        setLastHarvested(parsed.lastHarvested || null);
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const saveState = (g: number, wateredAt: number | null, harvReady: boolean, harvestedAt: number | null) => {
    if (typeof window === 'undefined') return;

    localStorage.setItem('tindy_plant_state', JSON.stringify({
      growth: g,
      lastWatered: wateredAt,
      harvestReady: harvReady,
      lastHarvested: harvestedAt,
    }));
  };

  const waterPlant = (weather?: WeatherData) => {
    if (weather?.condition === 'RAIN') return;
    const currentTime = Date.now();
    if (!lastWatered || (currentTime - lastWatered) >= 24 * 60 * 60 * 1000) {
      let growthIncrease = 15; // ~5–6 waterings to reach full over ~1 week

      if (weather?.condition === 'CLOUDY') growthIncrease -= 3;
      if (weather?.humidity && weather.humidity > 70) growthIncrease += 3;
      if (weather?.humidity && weather.humidity < 30) growthIncrease -= 3;

      growthIncrease = Math.max(5, growthIncrease);

      const newGrowth = Math.min(growth + growthIncrease, 100);
      const newHarvestReady = newGrowth >= 100;

      setGrowth(newGrowth);
      setHarvestReady(newHarvestReady);
      setLastWatered(currentTime);
      saveState(newGrowth, currentTime, newHarvestReady, lastHarvested);
      setNow(currentTime);
    }
  };

  const harvestPlant = () => {
    if (!harvestReady) return;
    const currentTime = Date.now();
    const resetGrowth = 0;
    setGrowth(resetGrowth);
    setHarvestReady(false);
    setLastHarvested(currentTime);
    passiveAnchorRef.current = null;
    saveState(resetGrowth, lastWatered, false, currentTime);
  };

  // passive growth: +2 per 12h window after 12h of no watering
  useEffect(() => {
    if (now === null || !lastWatered || harvestReady || growth >= 100) return;
    const hours = (now - lastWatered) / (1000 * 60 * 60);
    if (hours <= 12) return;
    const anchor = passiveAnchorRef.current ?? lastWatered;
    if (now - anchor < 12 * 60 * 60 * 1000) return;

    passiveAnchorRef.current = now;
    setGrowth(prev => {
      const newG = Math.min(prev + 2, 100);
      if (newG >= 100) setHarvestReady(true);
      return newG;
    });
  }, [now]);

  let hoursSince = null;
  if (now !== null && lastWatered) {
    hoursSince = (now - lastWatered) / (1000 * 60 * 60);
  }

  let status: 'DORMANT' | 'OPTIMAL' | 'WILTED' = 'DORMANT';
  if (hoursSince !== null) {
    status = hoursSince >= 48 ? 'WILTED' : 'OPTIMAL';
  }

  let hydration = 0;
  if (hoursSince !== null) {
    hydration = Math.max(0, Math.round(100 - (hoursSince / 48) * 100));
  }

  const isWilted = hydration < 30;

  let timeToNextMs = 0;
  const cooldownPeriod = 24 * 60 * 60 * 1000;
  if (now !== null && lastWatered) {
    const timeSince = now - lastWatered;
    if (timeSince < cooldownPeriod) {
      timeToNextMs = cooldownPeriod - timeSince;
    }
  }

  const canWater = timeToNextMs <= 0;

  let stage: PlantStage;
  if (growth < 25) stage = 'seed';
  else if (growth < 50) stage = 'small';
  else if (growth < 75) stage = 'medium';
  else stage = 'full';

  const leafCount = Math.floor(growth / 20); // 0 → 5

  return {
    growth,
    lastWatered,
    lastHarvested,
    status,
    hydration,
    isWilted,
    timeToNextMs,
    canWater,
    waterPlant,
    stage,
    leafCount,
    harvestReady,
    harvestPlant,
  };
};
