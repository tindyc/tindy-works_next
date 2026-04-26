import { useState, useEffect } from 'react';

export type WeatherCondition = 'CLEAR' | 'CLOUDY' | 'RAIN' | 'SNOW';

export interface WeatherData {
  temp: number;
  description: string;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
}

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchWeather = async () => {
      const cached = localStorage.getItem('tindy_weather_cache');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 3600 * 1000) {
          if (mounted) setWeather(data);
          return;
        }
      }
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5085&longitude=-0.1257&current_weather=true&hourly=relative_humidity_2m');
        const json = await res.json();
        const cw = json.current_weather;
        const currentHourIndex = new Date().getHours();
        const humidity = json.hourly?.relative_humidity_2m?.[currentHourIndex] || 50;

        let condition: WeatherCondition = 'CLEAR';
        let description = 'CLEAR SKY';
        const code = cw.weathercode;
        if ([0, 1].includes(code)) { condition = 'CLEAR'; description = 'CLEAR SKY'; }
        else if ([2, 3, 45, 48].includes(code)) { condition = 'CLOUDY'; description = 'CLOUDY'; }
        else if ([71, 73, 75, 77].includes(code)) { condition = 'SNOW'; description = 'SNOW'; }
        else { condition = 'RAIN'; description = 'LIGHT RAIN'; }

        const data: WeatherData = {
          temp: Math.round(cw.temperature),
          description,
          condition,
          humidity,
          windSpeed: Math.round(cw.windspeed)
        };
        if (mounted) setWeather(data);
        localStorage.setItem('tindy_weather_cache', JSON.stringify({ data, timestamp: Date.now() }));
      } catch (e) {
        console.error('Weather fetch error', e);
      }
    };
    fetchWeather();
    return () => { mounted = false; };
  }, []);

  return weather;
};
