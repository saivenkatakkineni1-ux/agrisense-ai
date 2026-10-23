/**
 * @license
 * AgriSense AI - Government-Grade Real-Data Agriculture Platform
 * Minimalist Precision Data Provenance & Source Audit Modal
 * Owner: Sai Venkat Akkineni
 */

import React, { useState } from 'react';
import { ShieldCheck, ExternalLink, X, Info } from 'lucide-react';
import { ProvenanceMetadata } from '../services/indiaLocationService';

interface DataProvenanceBadgeProps {
  provenance: ProvenanceMetadata;
  compact?: boolean;
}

export const DataProvenanceBadge: React.FC<DataProvenanceBadgeProps> = ({ provenance, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
        title="Inspect verifiable data provenance"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span className="truncate max-w-[200px]">
          {compact ? 'Verified Source' : provenance.sourceName.split('(')[0].trim()}
        </span>
        <span className="text-slate-400 font-normal">· Audit</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-left text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 text-emerald-700 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold tracking-tight text-slate-900">
                Official Provenance & Verification Audit Record
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                <div>
                  <span className="text-slate-500 block font-semibold text-[11px] uppercase tracking-wider">
                    Authoritative Provider
                  </span>
                  <span className="text-slate-900 font-semibold">{provenance.sourceName}</span>
                </div>

                {provenance.recordIdentifier && (
                  <div>
                    <span className="text-slate-500 block font-semibold text-[11px] uppercase tracking-wider">
                      Record Identifier
                    </span>
                    <code className="text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-[11px]">
                      {provenance.recordIdentifier}
                    </code>
                  </div>
                )}

                <div>
                  <span className="text-slate-500 block font-semibold text-[11px] uppercase tracking-wider">
                    Retrieval Timestamp (IST)
                  </span>
                  <span className="text-slate-800 font-medium">
                    {new Date(provenance.retrievalTimestamp).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      dateStyle: 'full',
                      timeStyle: 'medium',
                    })}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block font-semibold text-[11px] uppercase tracking-wider">
                    Verification Standard
                  </span>
                  <span className="font-semibold text-emerald-800">
                    {provenance.verificationLevel.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {provenance.disclaimer && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 leading-relaxed">
                  <span className="font-semibold block mb-0.5 text-[11px] uppercase tracking-wider text-amber-800">
                    Regulatory Standing & Limitations:
                  </span>
                  <p>{provenance.disclaimer}</p>
                </div>
              )}

              {provenance.sourceUrl && (
                <div className="pt-1">
                  <a
                    href={provenance.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
                  >
                    <span>View Official Source Endpoint / Data Registry</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium text-xs transition"
              >
                Close Audit Dialog
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
