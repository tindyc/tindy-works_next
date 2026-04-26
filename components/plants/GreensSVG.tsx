import React from 'react';
import { motion } from 'framer-motion';

const leafGroups = [
  {
    key: 'back-dark',
    animProps: { scale: [1, 1.02, 1] as number[], y: [0, -1, 0] as number[] },
    duration: 5, delay: 0,
    leaves: (
      <>
        <path d="M 0,0 C -80,-50 -70,-200 0,-150 C 50,-100 20,-20 0,0 Z" fill="url(#greens-leaf-dark)" />
        <path d="M 0,0 C 80,-40 90,-180 20,-220 C -20,-150 10,-30 0,0 Z" fill="url(#greens-leaf-dark)" />
      </>
    ),
  },
  {
    key: 'mid',
    animProps: { scale: [1, 1.03, 1] as number[], y: [0, -2, 0] as number[] },
    duration: 6, delay: 1,
    leaves: (
      <>
        <path d="M 0,0 C -120,-30 -80,-140 -20,-180 C 20,-120 -10,-30 0,0 Z" fill="url(#greens-leaf-med)" />
        <path d="M 0,0 C 100,-20 110,-120 40,-160 C 0,-100 10,-20 0,0 Z" fill="url(#greens-leaf-med)" />
        <path d="M 0,0 C -40,-80 -20,-250 30,-200 C 60,-150 30,-50 0,0 Z" fill="url(#greens-leaf-med)" />
      </>
    ),
  },
  {
    key: 'front-light',
    animProps: { scale: [1, 1.04, 1] as number[], y: [0, -1.5, 0] as number[] },
    duration: 4.5, delay: 2,
    leaves: (
      <>
        <path d="M 0,0 C -90,-10 -60,-100 -20,-120 C 10,-80 -10,-20 0,0 Z" fill="url(#greens-leaf-light)" />
        <path d="M 0,0 C 80,0 70,-90 10,-110 C -10,-70 10,-10 0,0 Z" fill="url(#greens-leaf-light)" />
        <path d="M 0,0 C -30,-40 0,-130 30,-100 C 40,-50 20,-20 0,0 Z" fill="url(#greens-leaf-light)" />
      </>
    ),
  },
  {
    key: 'very-front',
    animProps: { scale: [1, 1.05, 1] as number[], y: [0, 0, 0] as number[] },
    duration: 4, delay: 0.5,
    leaves: (
      <>
        <path d="M 0,0 C -40,10 -30,-60 -10,-70 C 10,-40 0,-10 0,0 Z" fill="#B0D5A5" />
        <path d="M 0,0 C 40,20 30,-50 10,-60 C -10,-30 0,-10 0,0 Z" fill="#A5CFA0" />
      </>
    ),
  },
];

export function GreensSVG({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 400" className={`w-full h-full overflow-visible ${className}`} preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="greens-leaf-light" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#9DC593" />
          <stop offset="100%" stopColor="#78A66C" />
        </radialGradient>
        <radialGradient id="greens-leaf-med" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#81B275" />
          <stop offset="100%" stopColor="#608C54" />
        </radialGradient>
        <radialGradient id="greens-leaf-dark" cx="70%" cy="70%" r="80%">
          <stop offset="0%" stopColor="#6A975E" />
          <stop offset="100%" stopColor="#4B7040" />
        </radialGradient>
      </defs>

      <g transform="translate(100, 340)">
        {leafGroups.map((group) => (
          <motion.g
            key={group.key}
            animate={{ scale: group.animProps.scale, y: group.animProps.y }}
            transition={{ duration: group.duration, repeat: Infinity, ease: 'easeInOut', delay: group.delay }}
          >
            {group.leaves}
          </motion.g>
        ))}
      </g>
    </svg>
  );
}
