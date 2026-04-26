import React from 'react';
import { motion } from 'framer-motion';

const stemGroups = [
  {
    key: 'center',
    sway: { rotate: [1, -1, 1] as number[] },
    duration: 5, delay: 0.5,
    stems: (
      <>
        <path d="M 0,0 Q -5,-120 10,-280" fill="none" stroke="url(#catmint-stem)" strokeWidth="4" strokeLinecap="round" />
        <path d="M 5,-60 Q 20,-150 -10,-250" fill="none" stroke="url(#catmint-stem)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="10" cy="-280" r="6" fill="url(#catmint-flower)" />
        <circle cx="2" cy="-270" r="5" fill="url(#catmint-flower)" />
        <circle cx="18" cy="-275" r="7" fill="url(#catmint-flower)" />
        <circle cx="12" cy="-290" r="4" fill="url(#catmint-flower)" />
        <circle cx="-10" cy="-250" r="5" fill="url(#catmint-flower)" />
        <circle cx="-15" cy="-240" r="4" fill="url(#catmint-flower)" />
      </>
    ),
  },
  {
    key: 'left',
    sway: { rotate: [-2, 2, -2] as number[] },
    duration: 4, delay: 0,
    stems: (
      <>
        <path d="M 0,0 Q -40,-80 -50,-200" fill="none" stroke="url(#catmint-stem)" strokeWidth="3" strokeLinecap="round" />
        <path d="M -10,-40 Q -60,-120 -80,-220" fill="none" stroke="url(#catmint-stem)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="-50" cy="-200" r="5" fill="url(#catmint-flower)" />
        <circle cx="-55" cy="-190" r="4" fill="url(#catmint-flower)" />
        <circle cx="-45" cy="-210" r="6" fill="url(#catmint-flower)" />
        <circle cx="-80" cy="-220" r="4" fill="url(#catmint-flower)" />
        <circle cx="-75" cy="-230" r="5" fill="url(#catmint-flower)" />
      </>
    ),
  },
  {
    key: 'right',
    sway: { rotate: [-1, 2, -1] as number[] },
    duration: 4.5, delay: 1,
    stems: (
      <>
        <path d="M 0,0 Q 50,-100 40,-240" fill="none" stroke="url(#catmint-stem)" strokeWidth="3" strokeLinecap="round" />
        <path d="M 10,-30 Q 70,-100 80,-190" fill="none" stroke="url(#catmint-stem)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="40" cy="-240" r="5" fill="url(#catmint-flower)" />
        <circle cx="48" cy="-230" r="6" fill="url(#catmint-flower)" />
        <circle cx="32" cy="-245" r="4" fill="url(#catmint-flower)" />
        <circle cx="80" cy="-190" r="5" fill="url(#catmint-flower)" />
        <circle cx="85" cy="-200" r="4" fill="url(#catmint-flower)" />
      </>
    ),
  },
];

export function CatmintSVG({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 400" className={`w-full h-full overflow-visible ${className}`} preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="catmint-stem" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A3B19B" />
          <stop offset="100%" stopColor="#7E9075" />
        </linearGradient>
        <radialGradient id="catmint-flower" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#C8B8D6" />
          <stop offset="100%" stopColor="#9B88B0" />
        </radialGradient>
      </defs>

      {[...Array(6)].map((_, i) => (
        <motion.circle
          key={`particle-${i}`}
          cx={60 + (i * 20)}
          cy={100 + (i * 30)}
          r={1.5}
          fill="#D4C8E1"
          animate={{ y: [0, -30, 0], x: [0, i % 2 === 0 ? 8 : -8, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
        />
      ))}

      <g transform="translate(100, 360)">
        {stemGroups.map((group) => (
          <motion.g
            key={group.key}
            animate={{ rotate: group.sway.rotate }}
            transition={{ duration: group.duration, repeat: Infinity, ease: 'easeInOut', delay: group.delay }}
          >
            {group.stems}
          </motion.g>
        ))}
        <path d="M 0,0 Q -20,-20 -40,-10 Q -20,0 0,0 Z" fill="#7E9075" />
        <path d="M 0,0 Q 25,-15 45,-5 Q 20,5 0,0 Z" fill="#697D5F" />
        <path d="M 0,0 Q -10,-30 -5,-40 Q 5,-20 0,0 Z" fill="#889C7E" />
      </g>
    </svg>
  );
}
