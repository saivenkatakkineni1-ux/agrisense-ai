/**
 * @license
 * AgriSense AI - Government-Grade Real-Data Agriculture Platform
 * Scientific Soil Health & Fertilizer Guidance Module
 * Grounded in ICAR STCR Guidelines & Soil Health Card Standards
 */

import React, { useState } from 'react';
import {
  SoilTestInputs,
  calculateSoilGuidance,
  ICAR_CROP_RDF,
  FertilizerRecommendation,
  NutrientAssessment,
} from '../services/soilAdvisoryService';
import { DataProvenanceBadge } from './DataProvenanceBadge';
import { FlaskConical, Beaker, CheckCircle2, FileText } from 'lucide-react';

export const SoilModule: React.FC = () => {
  const [soilType, setSoilType] = useState<SoilTestInputs['soilType']>('Black (Regur)');
  const [cropName, setCropName] = useState<string>('Paddy (Rice)');
  const [ph, setPh] = useState<number>(7.2);
  const [organicCarbon, setOrganicCarbon] = useState<number>(0.55);
  const [availN, setAvailN] = useState<number>(240);
  const [availP, setAvailP] = useState<number>(14);
  const [availK, setAvailK] = useState<number>(210);

  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [assessments, setAssessments] = useState<NutrientAssessment[]>([]);
  const [recommendation, setRecommendation] = useState<FertilizerRecommendation | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const result = calculateSoilGuidance({
      soilType,
      cropName,
      ph,
      organicCarbonPercent: organicCarbon,
      availableN_kgha: availN,
      availableP_kgha: availP,
      availableK_kgha: availK,
    });
    setAssessments(result.assessments);
    setRecommendation(result.recommendation);
    setHasCalculated(true);
  };

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'LOW':
      case 'VERY_LOW':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'MEDIUM':
        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      case 'HIGH':
      case 'VERY_HIGH':
        return 'text-blue-800 bg-blue-50 border-blue-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <FlaskConical className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Soil Health Card & Targeted Fertilizer Calculation
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ICAR-Indian Institute of Soil Science (IISS) Bhopal &bull; Soil Test Based Crop Response (STCR) Equations
          </p>
        </div>

        {recommendation && <DataProvenanceBadge provenance={recommendation.provenance} />}
      </div>

      {/* Inputs Form */}
      <form onSubmit={handleCalculate} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Crop</label>
            <select
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            >
              {Object.keys(ICAR_CROP_RDF).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Classification</label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            >
              <option value="Alluvial">Alluvial Soil (Indo-Gangetic / Coastal)</option>
              <option value="Black (Regur)">Black (Regur) Cotton Soil</option>
              <option value="Red & Yellow">Red & Yellow Soil</option>
              <option value="Laterite">Laterite Soil</option>
              <option value="Arid / Sandy">Arid / Sandy Soil</option>
              <option value="Saline / Alkaline">Saline / Alkaline Soil</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Reaction (pH)</label>
            <input
              type="number"
              step="0.1"
              min="3.0"
              max="11.0"
              value={ph}
              onChange={(e) => setPh(parseFloat(e.target.value) || 7.0)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Organic Carbon (OC %)</label>
            <input
              type="number"
              step="0.01"
              min="0.05"
              max="3.0"
              value={organicCarbon}
              onChange={(e) => setOrganicCarbon(parseFloat(e.target.value) || 0.5)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Available Nitrogen (N kg/ha)
            </label>
            <input
              type="number"
              min="50"
              max="1000"
              value={availN}
              onChange={(e) => setAvailN(parseInt(e.target.value) || 250)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">Standard Medium: 280 - 560 kg/ha</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Available Phosphorus (P₂O₅ kg/ha)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={availP}
              onChange={(e) => setAvailP(parseInt(e.target.value) || 15)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">Standard Medium: 10 - 25 kg/ha</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Available Potassium (K₂O kg/ha)
            </label>
            <input
              type="number"
              min="20"
              max="1000"
              value={availK}
              onChange={(e) => setAvailK(parseInt(e.target.value) || 200)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">Standard Medium: 108 - 280 kg/ha</span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Beaker className="w-4 h-4" />
            <span>Compute ICAR Fertilizer Requirement</span>
          </button>
        </div>
      </form>

      {/* Results Output */}
      {hasCalculated && recommendation && (
        <div className="space-y-5 pt-4 border-t border-slate-100">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              1. Soil Fertility Diagnostic Evaluation (ICAR-IISS Rating)
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Parameter</th>
                    <th className="px-4 py-2.5">Tested Value</th>
                    <th className="px-4 py-2.5">Rating Scale</th>
                    <th className="px-4 py-2.5">Benchmark</th>
                    <th className="px-4 py-2.5">Agronomic Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assessments.map((a, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{a.nutrient}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-800">
                        {a.measuredValue} {a.unit}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getRatingBadge(a.rating)}`}>
                          {a.rating}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">{a.standardMediumRange}</td>
                      <td className="px-4 py-2.5 text-slate-700 text-[11px]">{a.scientificRemark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              2. Recommended Straight Commercial Fertilizer Dosage (kg/hectare)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-xs text-slate-500">Urea (46% N)</span>
                <div className="text-2xl font-bold text-slate-900 font-mono">
                  {recommendation.commercialFertilizerDoseKgHa.ureaKg} <span className="text-xs font-normal text-slate-500">kg/ha</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">
                  Elemental Target: {recommendation.elementalRequirementKgHa.nitrogen_N} kg N
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-xs text-slate-500">Single Super Phosphate (16% P₂O₅)</span>
                <div className="text-2xl font-bold text-slate-900 font-mono">
                  {recommendation.commercialFertilizerDoseKgHa.sspKg} <span className="text-xs font-normal text-slate-500">kg/ha</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">
                  Elemental Target: {recommendation.elementalRequirementKgHa.phosphorus_P2O5} kg P₂O₅
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-xs text-slate-500">Muriate of Potash (60% K₂O)</span>
                <div className="text-2xl font-bold text-slate-900 font-mono">
                  {recommendation.commercialFertilizerDoseKgHa.mopKg} <span className="text-xs font-normal text-slate-500">kg/ha</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">
                  Elemental Target: {recommendation.elementalRequirementKgHa.potassium_K2O} kg K₂O
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900">3. Scientific Split Application Schedule</h4>
            <div className="space-y-1 text-slate-700">
              <p><strong>Basal Dose:</strong> {recommendation.applicationSchedule.basalDose}</p>
              <p><strong>First Top Dressing:</strong> {recommendation.applicationSchedule.firstTopDressing}</p>
              <p><strong>Second Top Dressing:</strong> {recommendation.applicationSchedule.secondTopDressing}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
