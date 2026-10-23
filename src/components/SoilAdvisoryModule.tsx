import React, { useState } from 'react';
import { 
  FlaskConical, 
  HelpCircle, 
  CheckCircle2, 
  Info, 
  BookOpen, 
  Scale, 
  Calculator, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';
import { 
  calculateSoilAdvisory, 
  SoilTestInput, 
  SoilAdvisoryResult, 
  ICAR_CROP_STANDARDS 
} from '../services/icarSoilService';

export const SoilAdvisoryModule: React.FC = () => {
  const [input, setInput] = useState<SoilTestInput>({
    crop: 'Rice (Paddy)',
    fieldAreaAcres: 2.5,
    nitrogenKgHa: 240, // Low (<280)
    phosphorusKgHa: 16, // Medium (10-25)
    potassiumKgHa: 290, // High (>280)
    organicCarbonPercent: 0.45, // Low (<0.50%)
    soilPh: 7.2, // Normal
  });

  const [result, setResult] = useState<SoilAdvisoryResult>(calculateSoilAdvisory(input));

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(calculateSoilAdvisory(input));
  };

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'Low':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-bold">Low (Deficient)</span>;
      case 'Medium':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-bold">Medium (Optimum)</span>;
      case 'High':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-bold">High (Sufficient)</span>;
      case 'Acidic':
        return <span className="bg-rose-100 text-rose-800 text-xs px-2 py-0.5 rounded font-bold">Acidic (&lt;6.5)</span>;
      case 'Normal':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-bold">Normal Neutral</span>;
      default:
        return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded font-bold">{rating}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
          <FlaskConical className="w-4 h-4 text-emerald-600" />
          <span>Agricultural Scientific Advisory Subsystem</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">ICAR Soil Health Card Nutrient Formulation Engine</h2>
        <p className="text-xs text-slate-500 mt-1">
          Calibrated strictly against the Indian Council of Agricultural Research (ICAR) STCR (Soil Test Crop Response) empirical guidelines. Zero synthetic black-box values.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Panel */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              Soil Test Report Input
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">STCR-v2</span>
          </div>

          <form onSubmit={handleCalculate} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Field Crop</label>
              <select
                value={input.crop}
                onChange={(e) => setInput({ ...input, crop: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                {Object.keys(ICAR_CROP_STANDARDS).map((crop) => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Field Area (Acres)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={input.fieldAreaAcres}
                onChange={(e) => setInput({ ...input, fieldAreaAcres: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Laboratory Soil Test Measurements:
              </span>

              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-slate-600 mb-0.5">
                    <span>Available Nitrogen (N)</span>
                    <span className="text-slate-400 font-mono">kg/ha</span>
                  </div>
                  <input
                    type="number"
                    value={input.nitrogenKgHa}
                    onChange={(e) => setInput({ ...input, nitrogenKgHa: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                  <div className="text-[10px] text-slate-400 mt-0.5">Norms: &lt;280 Low | 280-560 Med | &gt;560 High</div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-0.5">
                    <span>Available Phosphorus (P₂O₅)</span>
                    <span className="text-slate-400 font-mono">kg/ha</span>
                  </div>
                  <input
                    type="number"
                    value={input.phosphorusKgHa}
                    onChange={(e) => setInput({ ...input, phosphorusKgHa: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                  <div className="text-[10px] text-slate-400 mt-0.5">Norms: &lt;10 Low | 10-25 Med | &gt;25 High</div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-0.5">
                    <span>Available Potassium (K₂O)</span>
                    <span className="text-slate-400 font-mono">kg/ha</span>
                  </div>
                  <input
                    type="number"
                    value={input.potassiumKgHa}
                    onChange={(e) => setInput({ ...input, potassiumKgHa: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                  <div className="text-[10px] text-slate-400 mt-0.5">Norms: &lt;108 Low | 108-280 Med | &gt;280 High</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-0.5">Organic Carbon (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={input.organicCarbonPercent}
                      onChange={(e) => setInput({ ...input, organicCarbonPercent: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5">Soil Reaction (pH)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={input.soilPh}
                      onChange={(e) => setInput({ ...input, soilPh: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg text-xs transition shadow-sm cursor-pointer mt-2"
            >
              Recalculate Fertilizer Prescription
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Index Ratings */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center justify-between">
              <span>Soil Health Nutrient Status Card</span>
              <span className="text-xs font-mono text-slate-500">
                Area: {result.fieldAreaAcres} Acres ({result.fieldAreaHectares} Ha)
              </span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                <div className="text-[11px] text-slate-500 font-semibold">Nitrogen (N)</div>
                <div className="text-base font-bold text-slate-900">{result.nitrogenEvaluation.value} kg/ha</div>
                <div>{getRatingBadge(result.nitrogenEvaluation.rating)}</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                <div className="text-[11px] text-slate-500 font-semibold">Phosphorus (P₂O₅)</div>
                <div className="text-base font-bold text-slate-900">{result.phosphorusEvaluation.value} kg/ha</div>
                <div>{getRatingBadge(result.phosphorusEvaluation.rating)}</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                <div className="text-[11px] text-slate-500 font-semibold">Potassium (K₂O)</div>
                <div className="text-base font-bold text-slate-900">{result.potassiumEvaluation.value} kg/ha</div>
                <div>{getRatingBadge(result.potassiumEvaluation.rating)}</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                <div className="text-[11px] text-slate-500 font-semibold">Soil pH</div>
                <div className="text-base font-bold text-slate-900">{result.phEvaluation.value}</div>
                <div>{getRatingBadge(result.phEvaluation.rating)}</div>
              </div>
            </div>

            {result.soilAmendmentAdvice && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-0.5">Soil Amendment Advisory:</strong>
                  {result.soilAmendmentAdvice}
                </div>
              </div>
            )}
          </div>

          {/* Prescribed Commercial Fertilizer Schedule */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                Prescribed Commercial Fertilizer Dosage Schedule
              </h3>
              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded font-semibold">
                Adjusted RDF: {result.adjustedRdf.n}:{result.adjustedRdf.p}:{result.adjustedRdf.k} kg/ha
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Fertilizer Grade</th>
                    <th className="px-6 py-3 text-right">Dose (kg/ha)</th>
                    <th className="px-6 py-3 text-right">Total Farm (kg)</th>
                    <th className="px-6 py-3 text-right font-bold text-emerald-800">50kg Bags</th>
                    <th className="px-6 py-3">Application Split & Timing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-600">
                  {result.fertilizerSchedule.map((f, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-3 font-semibold text-slate-900">
                        {f.fertilizerName}
                        <span className="text-[10px] text-slate-400 block font-normal">{f.grade}</span>
                      </td>
                      <td className="px-6 py-3 text-right font-mono">{f.quantityKgPerHectare}</td>
                      <td className="px-6 py-3 text-right font-mono font-medium">{f.quantityTotalFieldKg}</td>
                      <td className="px-6 py-3 text-right font-bold text-emerald-700 font-mono text-sm">
                        {f.bags50kg} bags
                      </td>
                      <td className="px-6 py-3 text-[11px] text-slate-600 max-w-xs">{f.applicationSplit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mathematical Calculation Trace */}
          <div className="bg-slate-900 text-slate-200 rounded-xl p-5 border border-slate-800 text-xs font-mono space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                VERIFIABLE MATHEMATICAL CALCULATION AUDIT TRACE
              </span>
              <span className="text-[10px] text-slate-400">ZERO BLACK-BOX EQUATIONS</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              {result.calculationTrace.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500 select-none">[{idx + 1}]</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex flex-wrap justify-between">
              <span>Authority: {result.provenance.providerName}</span>
              <span>License: {result.provenance.license}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
