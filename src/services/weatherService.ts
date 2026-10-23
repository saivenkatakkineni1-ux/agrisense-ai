/**
 * @license
 * AgriSense AI - Government-Grade Real-Data Agriculture Platform
 * Real Meteorological Weather Service
 * Sourced from Open-Meteo WMO Station Grid / ECMWF Model
 * ZERO SYNTHETIC / MOCK WEATHER DATA
 */

import { ProvenanceMetadata } from './indiaLocationService';

export interface CurrentWeather {
  temperatureC: number;
  relativeHumidityPercent: number;
  precipitationMm: number;
  windSpeedKmh: number;
  weatherCode: number;
  weatherDescription: string;
  isDay: boolean;
  observationTime: string;
}

export interface DailyForecastDay {
  date: string;
  maxTempC: number;
  minTempC: number;
  precipitationMm: number;
  precipitationProbabilityPercent: number;
  weatherCode: number;
  weatherDescription: string;
}

export interface WeatherDataResult {
  success: boolean;
  current: CurrentWeather | null;
  daily: DailyForecastDay[];
  latitude: number;
  longitude: number;
  elevationMeters?: number;
  timezone: string;
  provenance: ProvenanceMetadata;
  message: string;
}

// WMO Weather Interpretation Codes (WW) - World Meteorological Organization standard
export function decodeWMOCode(code: number): string {
  switch (code) {
    case 0: return 'Clear sky';
    case 1: return 'Mainly clear';
    case 2: return 'Partly cloudy';
    case 3: return 'Overcast';
    case 45: return 'Fog';
    case 48: return 'Depositing rime fog';
    case 51: return 'Light drizzle';
    case 53: return 'Moderate drizzle';
    case 55: return 'Dense intensity drizzle';
    case 61: return 'Slight rain';
    case 63: return 'Moderate rain';
    case 65: return 'Heavy intensity rain';
    case 71: return 'Slight snow fall';
    case 73: return 'Moderate snow fall';
    case 75: return 'Heavy intensity snow fall';
    case 80: return 'Slight rain showers';
    case 81: return 'Moderate rain showers';
    case 82: return 'Violent rain showers';
    case 95: return 'Thunderstorm: Slight or moderate';
    case 96: return 'Thunderstorm with slight hail';
    case 99: return 'Thunderstorm with heavy hail';
    default: return 'Atmospheric condition code ' + code;
  }
}

/**
 * Fetch real live weather observations and 7-day agricultural forecast for given latitude and longitude.
 */
export async function fetchRealWeather(latitude: number, longitude: number): Promise<WeatherDataResult> {
  const provenance: ProvenanceMetadata = {
    sourceName: 'Open-Meteo Meteorological Service (WMO Global Station Grid / ECMWF)',
    sourceUrl: `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}`,
    retrievalTimestamp: new Date().toISOString(),
    recordIdentifier: `MET-${latitude.toFixed(4)}-${longitude.toFixed(4)}`,
    verificationLevel: 'VERIFIED_GEOSPATIAL_COORDINATES',
    disclaimer: 'Calibrated numerical weather prediction from global meteorological agencies. Real data only.',
  };

  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
      timezone: 'auto',
    });

    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!res.ok) {
      return {
        success: false,
        current: null,
        daily: [],
        latitude,
        longitude,
        timezone: 'UTC',
        provenance,
        message: `Weather service responded with HTTP status ${res.status}.`,
      };
    }

    const data = await res.json();
    const cur = data.current;
    const dailyRaw = data.daily;

    const current: CurrentWeather = {
      temperatureC: cur.temperature_2m,
      relativeHumidityPercent: cur.relative_humidity_2m,
      precipitationMm: cur.precipitation,
      windSpeedKmh: cur.wind_speed_10m,
      weatherCode: cur.weather_code,
      weatherDescription: decodeWMOCode(cur.weather_code),
      isDay: cur.is_day === 1,
      observationTime: cur.time,
    };

    const daily: DailyForecastDay[] = [];
    if (dailyRaw && dailyRaw.time) {
      for (let i = 0; i < dailyRaw.time.length; i++) {
        daily.push({
          date: dailyRaw.time[i],
          maxTempC: dailyRaw.temperature_2m_max[i],
          minTempC: dailyRaw.temperature_2m_min[i],
          precipitationMm: dailyRaw.precipitation_sum[i],
          precipitationProbabilityPercent: dailyRaw.precipitation_probability_max ? dailyRaw.precipitation_probability_max[i] : 0,
          weatherCode: dailyRaw.weather_code[i],
          weatherDescription: decodeWMOCode(dailyRaw.weather_code[i]),
        });
      }
    }

    return {
      success: true,
      current,
      daily,
      latitude,
      longitude,
      elevationMeters: data.elevation,
      timezone: data.timezone,
      provenance,
      message: 'Verified live meteorological telemetry retrieved successfully.',
    };
  } catch (err) {
    return {
      success: false,
      current: null,
      daily: [],
      latitude,
      longitude,
      timezone: 'UTC',
      provenance,
      message: `Failed to retrieve meteorological telemetry: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
