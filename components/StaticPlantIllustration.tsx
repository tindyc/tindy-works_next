import React from 'react';
import { SnakePlantSVG } from './plants/SnakePlantSVG';
import { CatmintSVG } from './plants/CatmintSVG';
import { GreensSVG } from './plants/GreensSVG';

export type PlantType = 'snake-plant' | 'catmint' | 'fresh-greens';

interface StaticPlantIllustrationProps {
  type: PlantType | string;
  className?: string;
}

export function StaticPlantIllustration({ type, className = '' }: StaticPlantIllustrationProps) {
  const cls = className || 'w-[220px] md:w-[260px] h-auto';
  switch (type) {
    case 'snake-plant':
      return <SnakePlantSVG className={cls} />;
    case 'catmint':
      return <CatmintSVG className={cls} />;
    case 'fresh-greens':
      return <GreensSVG className={cls} />;
    default:
      return <SnakePlantSVG className={cls} />;
  }
}
