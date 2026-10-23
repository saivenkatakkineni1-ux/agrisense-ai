/**
 * @license
 * AgriSense AI - Government-Grade Real-Data Agriculture Platform
 * Biometric Crop Yield Estimation Module
 * Grounded in Directorate of Economics & Statistics (DES) & ICAR Protocols
 */

import React, { useState } from 'react';
import {
  BiometricYieldInputs,
  calculateEmpiricalYield,
  YieldEstimationResult,
  DES_STATE_AVERAGE_YIELDS,
  ICAR_TEST_WEIGHT_NORMS,
} from '../services/yieldService';
import { OFFICIAL_INDIAN_STATES } from '../services/indiaLocationService';
import { DataProvenanceBadge } from './DataProvenanceBadge';
import { Calculator, Scale, Info } from 'lucide-react';

interface YieldModuleProps {
  initialState?: string;
}

export const YieldModule: React.FC<YieldModuleProps> = ({ initialState = 'Andhra Pradesh' }) => {
  const [cropName, setCropName] = useState<BiometricYieldInputs['cropName']>('Paddy (Rice)');
  const [state, setState] = useState<string>(initialState);
  const [fieldAreaAcres, setFieldAreaAcres] = useState<number>(3.5);
  const [plantDensity, setPlantDensity] = useState<number>(25);
  const [productiveTillers, setProductiveTillers] = useState<number>(14);
  const [grainCount, setGrainCount] = useState<number>(125);
  const [testWeight, setTestWeight] = useState<number>(22.0);
  const [irrigationStatus, setIrrigationStatus] = useState<BiometricYieldInputs['observedIrrigationStatus']>('IRRIGATED');

  const [result, setResult] = useState<YieldEstimationResult | null>(null);

  const handleCropChange = (c: BiometricYieldInputs['cropName']) => {
    setCropName(c);
    const norm = ICAR_TEST_WEIGHT_NORMS[c]?.normGrams || 22.0;
    setTestWeight(norm);
    if (c === 'Wheat') {
      setPlantDensity(200);
      setProductiveTillers(2);
      setGrainCount(40);
      setTestWeight(38.0);
    } else if (c === 'Maize') {
      setPlantDensity(6);
      setProductiveTillers(1);
      setGrainCount(450);
      setTestWeight(280.0);
    } else if (c === 'Mustard') {
      setPlantDensity(30);
      setProductiveTillers(15);
      setGrainCount(18);
      setTestWeight(4.5);
    } else if (c === 'Soybean') {
      setPlantDensity(35);
      setProductiveTillers(25);
      setGrainCount(45);
      setTestWeight(110.0);
    } else if (c === 'Cotton') {
      setPlantDensity(2);
      setProductiveTillers(20);
      setGrainCount(1);
      setTestWeight(85.0);
    } else {
      setPlantDensity(25);
      setProductiveTillers(14);
      setGrainCount(125);
      setTestWeight(22.0);
    }
  };

  const handleEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = calculateEmpiricalYield({
      cropName,
      state,
      fieldAreaAcres,
      plantDensityPerSquareMeter: plantDensity,
      productiveTillerOrPodsPerPlant: productiveTillers,
      grainOrBollCountPerUnit: grainCount,
      testWeight1000GrainsGrams: testWeight,
      observedIrrigationStatus: irrigationStatus,
    });
    setResult(res);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Biometric Crop Yield Estimation Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Directorate of Economics & Statistics (DES) &bull; Crop-Cutting Survey Equations &bull; State Benchmark Yields
          </p>
        </div>

        {result?.provenance && <DataProvenanceBadge provenance={result.provenance} />}
      </div>

      {/* Survey Form */}
      <form onSubmit={handleEstimate} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Type</label>
            <select
              value={cropName}
              onChange={(e) => handleCropChange(e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            >
              {Object.keys(DES_STATE_AVERAGE_YIELDS).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">State / Zone</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            >
              {OFFICIAL_INDIAN_STATES.map((st) => (
                <option key={st.name} value={st.name}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Field Size (Acres)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="5000"
              value={fieldAreaAcres}
              onChange={(e) => setFieldAreaAcres(parseFloat(e.target.value) || 1)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hydrology Status</label>
            <select
              value={irrigationStatus}
              onChange={(e) => setIrrigationStatus(e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            >
              <option value="IRRIGATED">Assured Canal / Tube Well</option>
              <option value="DEFICIT_IRRIGATED">Deficit / Supplementary</option>
              <option value="RAINFED">Rainfed Monsoon Dependent</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <span className="text-xs font-bold text-slate-900 block">
            Field Quadrant Biometric Sampling Parameters (Quadrat / m²)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Plant Density (Plants / m²)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="500"
                value={plantDensity}
                onChange={(e) => setPlantDensity(parseFloat(e.target.value) || 1)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Earheads / Pods per Plant
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="100"
                value={productiveTillers}
                onChange={(e) => setProductiveTillers(parseFloat(e.target.value) || 1)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Grains / Pod or Earhead
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={grainCount}
                onChange={(e) => setGrainCount(parseInt(e.target.value) || 1)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                1000-Grain Weight (g)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="500"
                value={testWeight}
                onChange={(e) => setTestWeight(parseFloat(e.target.value) || 20)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Scale className="w-4 h-4" />
            <span>Calculate Biometric Yield Projection</span>
          </button>
        </div>
      </form>

      {/* Results Output */}
      {result && (
        <div className="space-y-5 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500">Estimated Yield (kg/ha)</span>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                {result.estimatedYieldKgPerHectare.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-slate-500 font-sans">kg/ha</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">
                State Benchmark: {result.benchmarkAverageStateYieldKgHa} kg/ha ({result.performanceRatioPercent}%)
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500">Mandi Yield Metric</span>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                {result.estimatedYieldQuintalPerAcre}{' '}
                <span className="text-xs font-normal text-slate-500 font-sans">Quintal / Acre</span>
              </div>
              <div className="text-[11px] text-slate-500">1 Quintal = 100 kg bag</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500">Total Farm Harvest Quantity</span>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                {result.totalEstimatedHarvestTonnes}{' '}
                <span className="text-xs font-normal text-slate-500 font-sans">Metric Tonnes</span>
              </div>
              <div className="text-[11px] text-slate-500">Total field across {fieldAreaAcres} acres</div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-600" />
              Mathematical Derivation Steps
            </h4>
            <div className="space-y-1 font-mono text-slate-700 text-xs">
              {result.derivationSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">{idx + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
