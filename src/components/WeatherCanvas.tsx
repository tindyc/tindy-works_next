import { WeatherData } from '../hooks/useWeather';
import { DigitalPlant } from './DigitalPlant';

export function WeatherCanvas({ plant, weather, isDay, previewTime, context = 'canvas' }: { plant: any, weather: WeatherData | null, isDay: boolean, previewTime?: string, context?: 'canvas' | 'card' }) {
  const isClear = weather?.condition === 'CLEAR';
  const isCloudy = weather?.condition === 'CLOUDY';
  const isRain = weather?.condition === 'RAIN';
  const isSnow = weather?.condition === 'SNOW';

  // Scene colours — driven by time of day, independent of UI theme
  const bgClass = isDay ? 'bg-[#f5f5f5] text-[#111111]' : 'bg-[#0a0a0a] text-[#eeeeee]';
  const strokeClass = isDay ? 'stroke-[#111111]' : 'stroke-[#eeeeee]';

  const overlayBg = 'bg-[var(--overlay-bg)]';
  const overlayBorderClass = 'border-[var(--border-subtle)]';
  const textClass = 'text-[var(--text-primary)]';

  // Time badge — always high contrast against the scene background
  const badgeBg = isDay ? 'bg-black/80' : 'bg-white/80';
  const badgeText = isDay ? 'text-white' : 'text-black';

  const timeLabel = isDay ? 'DAY MODE' : 'NIGHT MODE';
  const timeString = previewTime ?? new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' });

  const mood = {
    isSunny: isClear && isDay,
    isRainy: isRain,
    isCloudy: isCloudy,
    isNight: !isDay,
  };

  const getContextMessage = () => {
    if (plant.harvestReady) {
      return "You have taken good care of your plant. It is ready to harvest.";
    }

    if (isRain) {
      return "It is raining in London. The plant is being naturally watered.";
    }

    let msg = "A calm " + (isDay ? "day" : "night") + " in London.";
    if (isClear && isDay) {
      msg = "A clear day. Sunlight is supporting the plant's growth.";
    } else if (isClear && !isDay) {
      msg = "A quiet night. The plant is resting.";
    } else if (isCloudy) {
      msg = "Overcast conditions. A stable environment for slow growth.";
    } else if (isSnow) {
      msg = "Snowing in London. The plant is conserving energy in colder conditions.";
    }

    if (plant.status === 'WILTED') {
      msg += " However, the plant is wilted. It urgently needs water to recover.";
    } else if (plant.hydration < 30) {
      msg += " Hydration is getting critically low.";
    } else if (plant.status === 'OPTIMAL' && plant.growth >= 40) {
      msg += " Consistent care is helping the plant thrive.";
    }

    return msg;
  };

  const isCard = context === 'card';

  return (
    <section className={`${isCard ? 'flex flex-col h-full' : 'flex-grow flex flex-col'} transition-colors duration-1000 ${bgClass}`}>

      {/* Canvas area */}
      <div className={`relative w-full overflow-hidden ${isCard ? 'h-full' : 'h-[60vh] min-h-[380px] md:min-h-[460px] lg:min-h-[520px]'}`}>

        {/* Time badge */}
        <div className={`absolute z-30 flex items-center border backdrop-blur-sm ${isCard ? 'top-2 right-2 px-2 py-1' : 'top-4 right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 px-3 py-1.5 md:px-4 md:py-2'} ${overlayBorderClass} ${badgeBg}`}>
          <span className={`font-sans font-semibold uppercase tracking-widest ${isCard ? 'text-[9px]' : 'text-[10px]'} ${badgeText}`}>{timeString} {timeLabel}</span>
        </div>

        {/* Weather SVG layers */}
        <div className="absolute inset-0 pointer-events-none opacity-40 z-10 overflow-hidden">
          <svg
            className={`w-full h-full fill-none ${strokeClass}`}
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 800 600"
          >
            {(isCloudy || isRain || isSnow) && (
              <g className="cloud-drift" strokeWidth="0.5">
                <path d="M 150 150 Q 180 120 220 150 Q 260 130 290 160 Q 320 190 280 210 Q 250 230 200 220 Q 150 230 130 200 Q 110 170 150 150 Z" />
                <path transform="translate(400, 100) scale(0.8)" d="M 150 150 Q 180 120 220 150 Q 260 130 290 160 Q 320 190 280 210 Q 250 230 200 220 Q 150 230 130 200 Q 110 170 150 150 Z" />
              </g>
            )}
            {isRain && (
              <g className="rain-layer" strokeWidth="1">
                {[100, 250, 400, 550, 700, 180, 320, 480, 620].map((x, i) => (
                  <line key={i} className="rain-drop" x1={x} x2={x} y1="0" y2={60} />
                ))}
              </g>
            )}
            {isClear && isDay && (
              <g className="sun-rotate" transform="translate(650, 150)">
                <circle strokeWidth="0.5" cx="0" cy="0" r="80" />
                <circle strokeWidth="1" cx="0" cy="0" r="60" />
                <path strokeWidth="1" d="M 0 -90 L 0 -110 M 0 90 L 0 110 M -90 0 L -110 0 M 90 0 L 110 0 M -65 -65 L -80 -80 M 65 65 L 80 80 M -65 65 L -80 80 M 65 -65 L 80 -80" />
              </g>
            )}
            {isClear && !isDay && (
              <circle strokeWidth="0.5" cx="650" cy="120" r="35" opacity="0.35" />
            )}
          </svg>
        </div>

        {/* Ground line */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-current opacity-10 z-10" />

        {/* Plant */}
        <div className="absolute inset-0 flex items-end justify-center z-20 px-4">
          <div className={`w-full flex items-end ${isCard ? 'max-w-[160px]' : 'max-w-[280px] sm:max-w-[340px] md:max-w-[420px] lg:max-w-[520px]'}`}>
            <DigitalPlant plant={plant} strokeClass={strokeClass} mood={mood} />
          </div>
        </div>

      </div>

      {/* Message panel — canvas context only */}
      {!isCard && (
        <>
          <div className="w-full h-px bg-[var(--border-subtle)] opacity-60" />
          <div className={`w-full flex-shrink-0 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 border-t transition-colors duration-1000 backdrop-blur-md ${overlayBorderClass} ${textClass} ${overlayBg}`}>
            <p className="font-sans text-sm sm:text-base leading-relaxed max-w-[420px] line-clamp-3">
              {getContextMessage()}
            </p>
          </div>
        </>
      )}

    </section>
  );
}
