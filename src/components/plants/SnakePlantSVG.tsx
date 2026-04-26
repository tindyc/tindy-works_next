import React from 'react';
import { motion } from 'framer-motion';

const leafDefs = [
  {
    path: 'M 0,0 Q -40,-150 -30,-300 Q -10,-200 0,0',
    sway: { rotate: [-2, 0, -2] as number[], skewX: [0, -1, 0] as number[] },
    duration: 6, delay: 0, edgeOpacity: 0.6,
  },
  {
    path: 'M 0,0 Q 30,-100 40,-250 Q 15,-150 0,0',
    sway: { rotate: [1, -1, 1] as number[], skewX: [0, 1, 0] as number[] },
    duration: 7, delay: 1, edgeOpacity: 0.6,
  },
  {
    path: 'M -10,0 Q -10,-180 5,-350 Q 15,-180 10,0 Z',
    sway: { rotate: [0, 1, 0] as number[], skewX: [0, 0, 0] as number[] },
    duration: 8, delay: 2, edgeOpacity: 0.8,
  },
  {
    path: 'M -5,0 Q -30,-80 -15,-180 Q -5,-100 0,0',
    sway: { rotate: [-1, 1, -1] as number[], skewX: [0, 0, 0] as number[] },
    duration: 5, delay: 0.5, edgeOpacity: 0.7,
  },
];

export function SnakePlantSVG({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 400" className={`w-full h-full overflow-visible ${className}`} preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="snake-leaf-1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A5D4A" />
          <stop offset="100%" stopColor="#2A382A" />
        </linearGradient>
        <linearGradient id="snake-edge-1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A4B58A" />
          <stop offset="20%" stopColor="transparent" />
          <stop offset="80%" stopColor="transparent" />
          <stop offset="100%" stopColor="#A4B58A" />
        </linearGradient>
      </defs>

      <g transform="translate(100, 380)">
        {leafDefs.map((leaf, i) => (
          <motion.g
            key={i}
            animate={{ rotate: leaf.sway.rotate, skewX: leaf.sway.skewX }}
            transition={{ duration: leaf.duration, repeat: Infinity, ease: 'easeInOut', delay: leaf.delay }}
          >
            <path d={leaf.path} fill="url(#snake-leaf-1)" />
            <path d={leaf.path} fill="url(#snake-edge-1)" opacity={leaf.edgeOpacity} />
          </motion.g>
        ))}
        <path d="M -25,0 L 25,0 L 20,20 L -20,20 Z" fill="#222" opacity="0.3" />
      </g>
    </svg>
  );
}
