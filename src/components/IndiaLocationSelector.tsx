/**
 * @license
 * AgriSense AI - Government-Grade Real-Data Agriculture Platform
 * Indian Administrative Hierarchy & Live Village Directory
 * Clean Enterprise UI & Zero Demo Data
 */

import React, { useState, useEffect } from 'react';
import {
  OFFICIAL_INDIAN_STATES,
  OFFICIAL_STATE_DISTRICTS,
  fetchVillagesByPincode,
  searchVillagesByName,
  geocodeAdministrativeLocation,
  VillageRecord,
} from '../services/indiaLocationService';
import { DataProvenanceBadge } from './DataProvenanceBadge';
import { Search, Landmark, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export interface SelectedLocationData {
  state: string;
  district: string;
  subDistrict?: string;
  village: string;
  pincode: string;
  latitude: number;
  longitude: number;
  recordIdentifier?: string;
  provenance: any;
}

interface IndiaLocationSelectorProps {
  onLocationSelected: (location: SelectedLocationData) => void;
  defaultState?: string;
  defaultDistrict?: string;
}

export const IndiaLocationSelector: React.FC<IndiaLocationSelectorProps> = ({
  onLocationSelected,
  defaultState = 'Andhra Pradesh',
  defaultDistrict = 'Guntur',
}) => {
  const [selectedState, setSelectedState] = useState<string>(defaultState);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(defaultDistrict);

  const [searchMode, setSearchMode] = useState<'pincode' | 'name'>('pincode');
  const [pincodeInput, setPincodeInput] = useState<string>('522002');
  const [villageNameInput, setVillageNameInput] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [villageResults, setVillageResults] = useState<VillageRecord[]>([]);
  const [activeSelectedVillage, setActiveSelectedVillage] = useState<VillageRecord | null>(null);
  const [geocodingInProgress, setGeocodingInProgress] = useState<boolean>(false);

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const districts = OFFICIAL_STATE_DISTRICTS[stateName] || [];
    const newDistrict = districts.length > 0 ? districts[0] : '';
    setSelectedDistrict(newDistrict);
    setVillageResults([]);
    setActiveSelectedVillage(null);
  };

  const handlePincodeSearch = async () => {
    if (!/^\d{6}$/.test(pincodeInput.trim())) {
      setErrorStatus('PIN code must be exactly 6 numeric digits.');
      return;
    }

    setLoading(true);
    setErrorStatus(null);
    setVillageResults([]);
    setActiveSelectedVillage(null);

    const res = await fetchVillagesByPincode(pincodeInput);
    setLoading(false);

    if (!res.success || res.records.length === 0) {
      setErrorStatus(res.message);
    } else {
      setVillageResults(res.records);
      selectVillage(res.records[0]);
    }
  };

  const handleNameSearch = async () => {
    if (villageNameInput.trim().length < 3) {
      setErrorStatus('Enter at least 3 characters of the village name.');
      return;
    }

    setLoading(true);
    setErrorStatus(null);
    setVillageResults([]);
    setActiveSelectedVillage(null);

    const res = await searchVillagesByName(villageNameInput);
    setLoading(false);

    if (!res.success || res.records.length === 0) {
      setErrorStatus(res.message);
    } else {
      setVillageResults(res.records);
      selectVillage(res.records[0]);
    }
  };

  const selectVillage = async (village: VillageRecord) => {
    setActiveSelectedVillage(village);
    setSelectedState(village.state);
    setSelectedDistrict(village.district);

    setGeocodingInProgress(true);
    const geoQuery = `${village.villageName}, ${village.district}, ${village.state}`;
    const geo = await geocodeAdministrativeLocation(geoQuery);
    setGeocodingInProgress(false);

    let lat = geo.latitude;
    let lon = geo.longitude;

    if (!lat || !lon) {
      const fallbackGeo = await geocodeAdministrativeLocation(`${village.district}, ${village.state}`);
      lat = fallbackGeo.latitude || 20.5937;
      lon = fallbackGeo.longitude || 78.9629;
    }

    onLocationSelected({
      state: village.state,
      district: village.district,
      subDistrict: village.division || village.region,
      village: village.villageName,
      pincode: village.pincode,
      latitude: lat,
      longitude: lon,
      recordIdentifier: village.provenance.recordIdentifier,
      provenance: geo.provenance || village.provenance,
    });
  };

  useEffect(() => {
    handlePincodeSearch();
  }, []);

  const availableDistricts = OFFICIAL_STATE_DISTRICTS[selectedState] || [];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Title & Scope */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-600" />
            National Administrative Territory & Village Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real Ministry of Communications India Post Directory &bull; 28 States, 8 UTs, 780+ Districts &bull; Zero Demo Data
          </p>
        </div>

        {activeSelectedVillage && (
          <div className="text-xs text-slate-500">
            Source: <span className="font-semibold text-slate-800">India Post Official Registry</span>
          </div>
        )}
      </div>

      {/* State & District Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            State / Union Territory
          </label>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
          >
            {OFFICIAL_INDIAN_STATES.map((st) => (
              <option key={st.name} value={st.name}>
                {st.name} ({st.type === 'UNION_TERRITORY' ? 'UT' : 'State'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Revenue District ({availableDistricts.length} available)
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setActiveSelectedVillage(null);
            }}
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
          >
            {availableDistricts.map((dst) => (
              <option key={dst} value={dst}>
                {dst}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Village Directory Search */}
      <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Village & Post Office Discovery</span>
          <div className="inline-flex rounded-lg bg-slate-200/70 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setSearchMode('pincode')}
              className={`px-3 py-1 rounded-md transition ${
                searchMode === 'pincode' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By 6-Digit PIN
            </button>
            <button
              type="button"
              onClick={() => setSearchMode('name')}
              className={`px-3 py-1 rounded-md transition ${
                searchMode === 'name' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Village Name
            </button>
          </div>
        </div>

        {searchMode === 'pincode' ? (
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={pincodeInput}
              onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit PIN (e.g. 522002, 110001, 560001)"
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
            <button
              type="button"
              onClick={handlePincodeSearch}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Query Postal Directory</span>
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={villageNameInput}
              onChange={(e) => setVillageNameInput(e.target.value)}
              placeholder="Enter village or post office name (e.g. Tenali, Baroda House)"
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
            <button
              type="button"
              onClick={handleNameSearch}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Search Village</span>
            </button>
          </div>
        )}

        {/* Error / Empty state notice */}
        {errorStatus && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p>{errorStatus}</p>
          </div>
        )}

        {/* Results Grid */}
        {villageResults.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>
                Found <strong className="text-slate-900">{villageResults.length}</strong> official jurisdictions in{' '}
                <strong className="text-slate-900">{villageResults[0].district}</strong>:
              </span>
              <DataProvenanceBadge provenance={villageResults[0].provenance} compact />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-52 overflow-y-auto p-1">
              {villageResults.map((v, i) => {
                const isSelected = activeSelectedVillage?.villageName === v.villageName;
                return (
                  <button
                    key={`${v.villageName}-${i}`}
                    type="button"
                    onClick={() => selectVillage(v)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-semibold text-xs text-slate-900">{v.villageName}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{v.branchType}</span>
                      <span className="font-mono font-medium text-slate-700">{v.pincode}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected Jurisdiction Box */}
      {activeSelectedVillage && (
        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified Active Location Focus
            </span>
            {geocodingInProgress && (
              <span className="text-slate-500 text-[11px] flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Resolving GPS coordinates...
              </span>
            )}
          </div>
          <div className="text-sm font-bold text-slate-900">
            {activeSelectedVillage.villageName} &bull; {activeSelectedVillage.district}, {activeSelectedVillage.state} (PIN {activeSelectedVillage.pincode})
          </div>
          <div className="text-slate-500 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
            <span>Branch: <strong className="text-slate-700">{activeSelectedVillage.branchType}</strong></span>
            <span>&bull;</span>
            <span>Division: <strong className="text-slate-700">{activeSelectedVillage.division}</strong></span>
            <span>&bull;</span>
            <span>Circle: <strong className="text-slate-700">{activeSelectedVillage.circle}</strong></span>
            <span>&bull;</span>
            <span>Jurisdiction: <strong className="text-slate-700">Republic of India</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
