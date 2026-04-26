import { motion, AnimatePresence } from 'framer-motion';

interface Plant {
  growth: number;
  leafCount: number;
  isWilted: boolean;
  harvestReady: boolean;
  hydration: number;
}

interface Mood {
  isSunny: boolean;
  isRainy: boolean;
  isCloudy: boolean;
  isNight: boolean;
}

interface DigitalPlantProps {
  plant: Plant;
  strokeClass: string;
  mood?: Mood;
  context?: 'canvas' | 'card';
}

const GROUND_Y = 560;

// Single stem: M 200 500 Q 195 300 200 100
// Because control point Y=300 = (500+100)/2, Y is linear in t: Y = 500 - 400*t
// Arc length ≈ t for near-straight bezier → pathLength ≈ (500 - leafY) / 400
// Leaves ordered bottom-to-top; threshold = pathLength when stem tip reaches that leaf's Y
const leafPaths = [
  { threshold: 0.20,  out: "M 197 420 Q 250 400 280 440 Q 240 460 197 420", in: "M 197 420 Q 240 420 280 440" },
  { threshold: 0.275, out: "M 198 390 Q 260 400 290 370 Q 240 360 198 390", in: "M 198 390 Q 250 380 290 370" },
  { threshold: 0.40,  out: "M 195 340 Q 120 300 100 360 Q 140 380 195 340", in: "M 195 340 Q 140 330 100 360" },
  { threshold: 0.50,  out: "M 195 300 Q 130 270 90 300 Q 140 330 195 300",  in: "M 195 300 Q 140 300 90 300" },
  { threshold: 0.575, out: "M 198 270 Q 260 230 270 180 Q 220 200 198 270", in: "M 198 270 Q 240 220 270 180" },
  { threshold: 0.70,  out: "M 200 220 Q 150 170 140 120 Q 180 160 200 220", in: "M 200 220 Q 160 160 140 120" },
  { threshold: 0.825, out: "M 198 170 Q 260 130 280 80 Q 230 100 198 170",  in: "M 198 170 Q 240 120 280 80" },
  { threshold: 0.95,  out: "M 195 120 Q 120 90 80 140 Q 130 160 195 120",   in: "M 195 120 Q 130 110 80 140" },
];

const fruits = [
  { x: 190, y: 220 },
  { x: 210, y: 180 },
  { x: 180, y: 300 },
];

export function DigitalPlant({ plant, strokeClass, mood, context = 'canvas' }: DigitalPlantProps) {
  const baseScale = context === 'card' ? 0.85 : 0.95;
  const growthFactor = context === 'card' ? 160 : 200;
  const plantScale = baseScale + (plant.growth / growthFactor) + (plant.harvestReady ? 0.04 : 0);
  const clampedScale = context === 'card'
    ? Math.min(plantScale, 1.15)
    : Math.min(plantScale, 1.2);

  const hydration = plant.hydration ?? 100;
  const wiltSeverity =
    hydration > 30 ? 0 :
    hydration > 20 ? 1 :
    hydration > 10 ? 2 : 3;

  const baseRotation =
    wiltSeverity === 0 ? 0 :
    wiltSeverity === 1 ? 3 :
    wiltSeverity === 2 ? 6 : 10;

  const finalRotation = baseRotation + (mood?.isSunny ? -2 : 0);
  const wiltScaleY = wiltSeverity === 0 ? 1 : wiltSeverity === 1 ? 0.95 : wiltSeverity === 2 ? 0.9 : 0.85;
  const moodScale = (mood?.isCloudy ? 0.95 : 1) * (mood?.isNight ? 0.98 : 1);
  const finalScaleX = clampedScale * moodScale;
  const finalScaleY = clampedScale * moodScale * wiltScaleY;
  const plantOpacity = wiltSeverity === 0 ? 1 : wiltSeverity === 1 ? 0.9 : wiltSeverity === 2 ? 0.75 : 0.65;
  const leafOpacity = wiltSeverity === 0 ? 1 : wiltSeverity === 1 ? 0.9 : wiltSeverity === 2 ? 0.7 : 0.5;
  const leafDroop = wiltSeverity === 0 ? 0 : wiltSeverity === 1 ? 3 : wiltSeverity === 2 ? 5 : 8;
  const leafRotate = (index: number) =>
    wiltSeverity === 0 ? 0 : index % 2 === 0 ? wiltSeverity * 3 : -(wiltSeverity * 3);

  const animDuration = mood?.isNight ? 1.2 : 0.8;

  // Single continuous stem from pot (Y=500) to top (Y=100)
  const stemLength = Math.max(plant.growth / 100, 0.12);
  const stemWidth = 1.5 + plant.growth / 80;

  // Leaves appear when stem tip passes their Y — threshold matches geometry
  const leafProgress = plant.growth / 100;
  const smoothLeaves = leafPaths.map((leaf, index) => {
    const progress = Math.min(Math.max((leafProgress - leaf.threshold) / 0.08, 0), 1);
    return { ...leaf, index, visible: leafProgress > leaf.threshold, progress };
  });

  const dropLevel =
    hydration > 30 ? 0 :
    hydration > 20 ? 1 :
    hydration > 10 ? 2 : 3;

  const appearedLeaves = smoothLeaves.filter(l => l.visible);
  const visibleCount = Math.max(appearedLeaves.length - dropLevel, 0);
  const visibleLeaves = appearedLeaves.slice(0, visibleCount);
  const droppedLeaves = appearedLeaves.slice(visibleCount);

  return (
    <svg
      className={`w-full h-full max-w-2xl fill-none stroke-[1.5] transition-colors duration-1000 ${strokeClass}`}
      preserveAspectRatio="xMidYMax meet"
      viewBox="0 80 400 520"
    >
      <g className="opacity-[0.03] stroke-[0.5]">
        <line x1="200" x2="200" y1="80" y2="600" />
        <line x1="0" x2="400" y1="340" y2="340" />
        <circle cx="200" cy="340" r="150" />
        <circle cx="200" cy="340" r="150" strokeDasharray="4 4" className="stroke-[1]" />
      </g>

      <AnimatePresence>
        {plant.harvestReady && (
          <motion.g
            key="harvest-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.circle
              cx="200"
              cy="530"
              r={20}
              fill="none"
              strokeWidth="1"
              animate={{ r: [20, 34, 20], opacity: [0.15, 0.5, 0.15] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.g>
        )}
      </AnimatePresence>

      <motion.g
        animate={mood?.isRainy ? { y: [0, -4, 0] } : { y: 0 }}
        transition={
          mood?.isRainy
            ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            : { duration: animDuration, ease: 'easeInOut' }
        }
      >
        <motion.g
          animate={{
            scaleX: finalScaleX,
            scaleY: finalScaleY,
            rotate: finalRotation,
            y: 0,
            opacity: plantOpacity,
          }}
          style={{ transformOrigin: `200px ${GROUND_Y}px` }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
        >
          <path d="M 160 560 L 240 560 L 250 500 L 150 500 Z" />
          <line x1="145" x2="255" y1="500" y2="500" />

          {/* Single continuous stem — Y = 500 - 400*pathLength */}
          <motion.path
            d="M 200 500 Q 195 300 200 100"
            strokeWidth={stemWidth}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: stemLength }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />

          <AnimatePresence>
            {visibleLeaves.map((leaf) => (
              <motion.g
                key={leaf.index}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{
                  opacity: leafOpacity * leaf.progress,
                  scale: leaf.progress,
                  y: leafDroop,
                  rotate: leafRotate(leaf.index),
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: animDuration, delay: leaf.index * 0.1 }}
                className="stroke-[1.5]"
                style={{ transformOrigin: 'center center' }}
              >
                <path d={leaf.out} />
                <path className="stroke-[0.5]" d={leaf.in} />
              </motion.g>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {droppedLeaves.map((leaf, i) => (
              <motion.g
                key={`drop-${leaf.index}`}
                initial={{ opacity: 1, y: 0, rotate: 0 }}
                animate={{
                  y: 120 + i * 20,
                  x: i % 2 === 0 ? -20 : 20,
                  rotate: i % 2 === 0 ? -45 : 45,
                  opacity: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeIn' }}
              >
                <path d={leaf.out} />
                <path d={leaf.in} className="stroke-[0.5]" />
              </motion.g>
            ))}
          </AnimatePresence>

          {dropLevel >= 1 && (
            <g opacity={0.5} strokeWidth="1">
              <path d="M 148 555 Q 160 548 172 555 Q 160 562 148 555" />
              <path d="M 150 555 Q 160 551 170 555" strokeWidth="0.5" />
            </g>
          )}
          {dropLevel >= 2 && (
            <g opacity={0.5} strokeWidth="1">
              <path d="M 228 557 Q 240 550 252 557 Q 240 564 228 557" />
              <path d="M 230 557 Q 240 553 250 557" strokeWidth="0.5" />
              <path d="M 174 553 Q 184 546 194 553 Q 184 560 174 553" />
              <path d="M 176 553 Q 184 549 192 553" strokeWidth="0.5" />
            </g>
          )}
          {dropLevel >= 3 && (
            <g opacity={0.5} strokeWidth="1">
              <path d="M 204 551 Q 216 544 228 551 Q 216 558 204 551" />
              <path d="M 206 551 Q 216 547 226 551" strokeWidth="0.5" />
              <path d="M 130 556 Q 142 549 154 556 Q 142 563 130 556" />
              <path d="M 132 556 Q 142 552 152 556" strokeWidth="0.5" />
            </g>
          )}

          <AnimatePresence>
            {plant.harvestReady && fruits.map((fruit, i) => (
              <motion.g
                key={`fruit-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ y: 40, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.12 }}
                style={{ transformOrigin: `${fruit.x}px ${fruit.y}px` }}
              >
                <motion.circle
                  cx={fruit.x}
                  cy={fruit.y}
                  r={9}
                  fill="none"
                  strokeWidth={0.5}
                  animate={{ r: [9, 13, 9], opacity: [0.08, 0.22, 0.08] }}
                  transition={{ duration: 2.8 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                />
                <motion.circle
                  cx={fruit.x}
                  cy={fruit.y}
                  r={4.5}
                  fill="currentColor"
                  fillOpacity={0.28}
                  strokeWidth={1.5}
                  animate={{ scale: [0.85, 1, 0.85], y: [-2, 2, -2], opacity: [0.75, 1, 0.75] }}
                  transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                />
              </motion.g>
            ))}
          </AnimatePresence>
        </motion.g>
      </motion.g>
    </svg>
  );
}
