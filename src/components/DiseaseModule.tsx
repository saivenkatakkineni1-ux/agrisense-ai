/**
 * @license
 * AgriSense AI - Government-Grade Real-Data Agriculture Platform
 * Transparent Crop Disease Pathology Module
 * Grounded in PlantVillage Research Dataset (CC BY-SA 4.0) & ICAR Protocols
 */

import React, { useState } from 'react';
import {
  analyzeCropDiseaseImage,
  DiseaseAnalysisResult,
} from '../services/diseaseService';
import { DataProvenanceBadge } from './DataProvenanceBadge';
import {
  Microscope,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Info,
  XCircle,
} from 'lucide-react';

export const DiseaseModule: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<DiseaseAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRunInference = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setError(null);

    try {
      const res = await analyzeCropDiseaseImage(selectedImage, mimeType);
      setResult(res);
    } catch (err) {
      let msg = err instanceof Error ? err.message : String(err);
      try {
        const parsedErr = JSON.parse(msg);
        if (parsedErr?.error?.message) {
          msg = parsedErr.error.message;
        } else if (parsedErr?.error) {
          msg = typeof parsedErr.error === 'string' ? parsedErr.error : JSON.stringify(parsedErr.error);
        }
      } catch {
        // Not JSON formatted
      }
      setError(`Pathology Diagnostic Notice: ${msg}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Microscope className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Crop Foliage Pathology & Pathogen Diagnosis
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Calibrated on PlantVillage Research Dataset (Penn State University, CC BY-SA 4.0) &bull; ICAR Protection Protocols
          </p>
        </div>

        {result?.provenance && <DataProvenanceBadge provenance={result.provenance} />}
      </div>

      {/* Dataset & Bias Disclosure */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700">
        <div className="flex items-center space-x-2 text-slate-900 font-bold">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>Scientific Dataset Calibration Notice</span>
        </div>
        <p className="leading-relaxed text-slate-600">
          The computer vision inference pipeline references the PlantVillage open benchmark dataset (54,303 annotated
          samples under CC BY-SA 4.0). Laboratory images may exhibit statistical distribution shift in unconstrained
          field conditions with dust, overlapping pests, and variable sunlight. This output is a research estimate, NOT a
          statutory phytosanitary certificate.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div className="space-y-4">
        {!selectedImage ? (
          <label className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition text-center group">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:text-emerald-700 transition mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-900">Upload a clear photograph of the affected leaf</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Supports JPG, PNG, WebP</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <img
              src={selectedImage}
              alt="Leaf specimen"
              className="w-44 h-44 object-cover rounded-xl border border-slate-300 shadow-sm"
            />
            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Specimen Ready</span>
                <p className="text-sm font-bold text-slate-900">Leaf Foliage Image Loaded</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunInference}
                  disabled={analyzing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Microscope className="w-4 h-4" />}
                  <span>{analyzing ? 'Analyzing Specimen...' : 'Run Pathogen Diagnostic'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={analyzing}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition"
                >
                  Clear Photo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-800">
          <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Results Card */}
      {result && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
              <div>
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Host Crop: {result.cropIdentified}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{result.pathologyDiagnosed}</h3>
                <span className="text-xs text-slate-500 italic">
                  Pathogen: {result.scientificPathogen}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Measured Confidence</span>
                <span className="text-2xl font-bold font-mono text-emerald-700">
                  {result.confidenceScorePercent}%
                </span>
              </div>
            </div>

            {result.observedSymptoms.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-slate-800">Observed Leaf Symptoms:</span>
                <div className="flex flex-wrap gap-1.5">
                  {result.observedSymptoms.map((symp, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 font-medium text-xs"
                    >
                      {symp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-emerald-800 block">Cultural & Preventive</span>
                <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                  {result.agronomicManagement.culturalControl.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-teal-800 block">Biological Controls</span>
                <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                  {result.agronomicManagement.biologicalControl.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-amber-800 block">ICAR Approved Chemicals</span>
                <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                  {result.agronomicManagement.approvedChemicalsICAR.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900">Statutory Notice:</strong>
                <span>{result.mandatoryAdvisory}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
