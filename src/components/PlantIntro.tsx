import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface PlantIntroProps {
  onExploreClick?: () => void;
}

export function PlantIntro({ onExploreClick }: PlantIntroProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const handleScroll = () => {
    if (window.innerWidth < 768 && onExploreClick) {
      onExploreClick();
    } else {
      document.getElementById('plant-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: "easeOut" as const } }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center px-4 md:px-6 xl:px-8 py-16 md:py-12 overflow-hidden bg-[var(--bg-base)]">
      
      {/* Subtle Visual Anchor - Blurred Organic Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-[800px] aspect-square rounded-full pointer-events-none transition-all duration-400 ${isLight ? 'bg-[#b7c8bd]' : 'bg-[#6f8f7c]'}`}
           style={{ 
             filter: 'blur(var(--ambient-blur, 100px))',
             opacity: 'var(--ambient-glow-opacity, 0.05)'
           }} />

      {/* Intro Animation Block */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 font-body-md text-[var(--text-secondary)] leading-relaxed md:leading-[1.8] flex flex-col gap-8 md:gap-6 lg:gap-10 text-sm md:text-[13px] lg:text-base max-w-2xl mx-auto"
      >
        <motion.p variants={itemVariants} className="font-['Inter'] text-xl md:text-lg lg:text-2xl text-[var(--text-secondary)] tracking-wide font-medium">
          Grown for fun, shared with love.
        </motion.p>

        <motion.p variants={itemVariants}>
          Some for your space,<br />
          some for your kitchen,<br />
          some for your cat (who might actually care).
        </motion.p>

        <motion.p variants={itemVariants}>
          These are real plants I’ve grown at home —<br />
          I grow more than I need, and it feels better to share them<br />
          to brighten someone’s day, even just a little.
        </motion.p>

        <motion.p variants={itemVariants}>
          If you’ve ever wanted to grow something of your own,<br />
          I’d love to help you start.
        </motion.p>
      </motion.div>

      {/* Engaging CTA */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 1.5 }}
        className="mt-16 md:mt-12 lg:mt-20 flex flex-col items-center gap-6 relative z-10"
      >
        <button 
          onClick={handleScroll}
          className="group flex flex-row items-center gap-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-500 focus:outline-none"
        >
          <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] transition-transform duration-500 group-hover:-translate-x-1">
            Explore what&apos;s growing
          </span>
          <motion.div
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors duration-500"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </motion.div>
        </button>
        <div className="w-px h-8 bg-gradient-to-b from-[var(--border-subtle)] to-transparent hidden md:block" />
        <span className="font-['Space_Grotesk'] tracking-widest text-[10px] text-[var(--text-muted)] uppercase mt-4 md:mt-2 hidden xl:block">
          Real plants, grown at home
        </span>
      </motion.div>

    </div>
  );
}
