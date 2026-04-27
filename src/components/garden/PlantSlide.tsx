import React from 'react';
import { motion } from 'framer-motion';
import { PlantDef } from './PlantCarousel';
import { StaticPlantIllustration } from './StaticPlantIllustration';
import { useTheme } from '@/context/ThemeContext';

interface PlantSlideProps {
  plant: PlantDef;
  isActive: boolean;
  onRequest: (plant: PlantDef) => void;
}

export const PlantSlide: React.FC<PlantSlideProps> = ({ plant, isActive, onRequest }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="w-full min-w-full flex-shrink-0 flex justify-center snap-center px-4 sm:px-6 md:px-8 py-8 md:py-10 lg:py-12 bg-[var(--bg-base)]">
      <motion.div
        className="w-full max-w-[500px] flex flex-col items-center gap-6 md:gap-8"
        initial={{ opacity: 0.92, y: 12 }}
        animate={{ opacity: isActive ? 1 : 0.9, y: isActive ? 0 : 10 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <h3 className="font-['Space_Grotesk'] text-sm md:text-base tracking-[0.18em] uppercase text-[var(--text-secondary)] opacity-70 text-center">
          {plant.name}
        </h3>

        <div
          className={`w-full max-w-[420px] aspect-[3/4] rounded-2xl border border-[var(--border-strong)] p-8 flex items-end justify-center ${isLight ? 'bg-[#f3f3f1] shadow-[inset_0_0_40px_rgba(0,0,0,0.08)]' : 'bg-[var(--bg-base)] shadow-[0_10px_40px_rgba(0,0,0,0.6)]'}`}
        >
          <div
            className="w-full h-full flex items-end justify-center"
            style={{
              filter: isLight ? 'contrast(1.15) saturate(1.1)' : 'none',
            }}
          >
            <StaticPlantIllustration type={plant.id} className="w-[220px] md:w-[260px] h-auto" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <p className="font-mono text-xs tracking-[0.12em] uppercase text-[var(--text-secondary)] opacity-80">
            {plant.vibe}
          </p>
          <button
            onClick={() => onRequest(plant)}
            className="border border-[var(--border-strong)] text-[var(--text-primary)] bg-transparent hover:bg-[var(--text-primary)] hover:text-[var(--bg-base)] transition-all duration-300 rounded-full px-6 py-3 shadow-[0_4px_20px_var(--shadow-base)]"
          >
            REQUEST THIS PLANT
          </button>
        </div>
      </motion.div>
    </div>
  );
}
