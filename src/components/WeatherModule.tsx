/**
 * @license
 * AgriSense AI - Government-Grade Real-Data Agriculture Platform
 * Meteorological Intelligence & WMO Telemetry Module
 * Clean Enterprise UI & Zero Demo Data
 */

import React, { useState, useEffect } from 'react';
import { fetchRealWeather, WeatherDataResult } from '../services/weatherService';
import { DataProvenanceBadge } from './DataProvenanceBadge';
import { CloudSun, Droplets, Wind, Thermometer, Calendar, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

interface WeatherModuleProps {
  latitude: number;
  longitude: number;
  locationName: string;
}

export const WeatherModule: React.FC<WeatherModuleProps> = ({ latitude, longitude, locationName }) => {
  const [data, setData] = useState<WeatherDataResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchRealWeather(latitude, longitude);
    setLoading(false);
    if (!res.success || !res.current) {
      setError(res.message);
    } else {
      setData(res);
    }
  };

  useEffect(() => {
    loadWeather();
  }, [latitude, longitude]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Module Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <CloudSun className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Real-Time Agro-Meteorological Telemetry
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            WMO Global Station Grid &bull; Location:{' '}
            <strong className="text-slate-800">{locationName}</strong> ({latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {data?.provenance && <DataProvenanceBadge provenance={data.provenance} />}
          <button
            type="button"
            onClick={loadWeather}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs transition flex items-center gap-1.5"
            title="Refresh Live Meteorological Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-500">
          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
          <p className="text-xs font-medium">Querying World Meteorological Organization station observation grid...</p>
        </div>
      )}

      {!loading && error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-sm text-slate-900 block">Live Meteorological Feed Unavailable</span>
            <p>{error}</p>
            <span className="text-slate-500 text-[11px] block mt-1">
              Zero Demo Data Rule: Simulated or placeholder weather values are strictly forbidden.
            </span>
          </div>
        </div>
      )}

      {!loading && data?.current && (
        <div className="space-y-6">
          {/* Main 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-amber-600" />
                Air Temperature
              </span>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                {data.current.temperatureC}°C
              </div>
              <div className="text-[11px] text-slate-500">{data.current.weatherDescription}</div>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-sky-600" />
                Relative Humidity
              </span>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                {data.current.relativeHumidityPercent}%
              </div>
              <div className="text-[11px] text-slate-500">Vapor saturation</div>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-emerald-600" />
                Surface Rainfall
              </span>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                {data.current.precipitationMm} mm
              </div>
              <div className="text-[11px] text-slate-500">Current gauge reading</div>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-slate-600" />
                Surface Wind Speed
              </span>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                {data.current.windSpeedKmh} km/h
              </div>
              <div className="text-[11px] text-slate-500">10m anemometer velocity</div>
            </div>
          </div>

          {/* 7-Day Forecast Strip */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-600" />
              7-Day Calibrated Agricultural Forecast (WMO Standard)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {data.daily.map((day, i) => (
                <div
                  key={day.date}
                  className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 text-left ${
                    i === 0 ? 'bg-emerald-50/60 border-emerald-300' : 'bg-slate-50/60 border-slate-200/80'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-800">
                    {new Date(day.date).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-2 min-h-[32px]">
                    {day.weatherDescription}
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-700 font-bold">{day.maxTempC}°</span>
                    <span className="text-slate-400">{day.minTempC}°</span>
                  </div>
                  <div className="text-[11px] text-sky-700 font-medium">
                    Rain: {day.precipitationMm} mm
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
