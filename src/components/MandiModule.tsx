/**
 * @license
 * AgriSense AI - Government-Grade Real-Data Agriculture Platform
 * Lead Architect & Executive Owner: Sai Venkat Akkineni
 * Agmarknet APMC Mandi Daily Prices Module
 * Real OGD Gateway Connection & Zero Demo Data
 */

import React, { useState, useEffect } from 'react';
import {
  fetchRealMandiPrices,
  MandiPriceRecord,
  getStoredDataGovApiKey,
  saveStoredDataGovApiKey,
  DEFAULT_DATAGOV_KEY,
} from '../services/mandiService';
import { OFFICIAL_INDIAN_STATES, OFFICIAL_STATE_DISTRICTS } from '../services/indiaLocationService';
import { AGMARKNET_COMMODITY_CATEGORIES, ALL_AGMARKNET_COMMODITIES } from '../data/agmarknetCommodities';
import { SearchableSelect } from './SearchableSelect';
import { DataProvenanceBadge } from './DataProvenanceBadge';
import {
  TrendingUp,
  Key,
  Search,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface MandiModuleProps {
  initialState?: string;
  initialDistrict?: string;
  isAdmin?: boolean;
}

const POPULAR_COMMODITIES = [
  'Chilli Red',
  'Paddy(Dhan)(Common)',
  'Cotton',
  'Wheat',
  'Onion',
  'Tomato',
  'Turmeric',
  'Soyabean',
  'Groundnut',
];

export const MandiModule: React.FC<MandiModuleProps> = ({
  initialState = 'Andhra Pradesh',
  initialDistrict = 'Guntur',
  isAdmin = false,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>(
    getStoredDataGovApiKey() === DEFAULT_DATAGOV_KEY ? '' : getStoredDataGovApiKey()
  );
  const [isConfiguringKey, setIsConfiguringKey] = useState<boolean>(false);
  const [keySavedMessage, setKeySavedMessage] = useState<string | null>(null);

  const [stateFilter, setStateFilter] = useState<string>(initialState);
  const [districtFilter, setDistrictFilter] = useState<string>(initialDistrict);
  const [commodityFilter, setCommodityFilter] = useState<string>('Chilli Red');

  const [records, setRecords] = useState<MandiPriceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isApiConfigured, setIsApiConfigured] = useState<boolean>(true);

  const loadPrices = async () => {
    setLoading(true);
    setStatusMessage(null);

    const res = await fetchRealMandiPrices({
      state: stateFilter.trim() || undefined,
      district: districtFilter.trim() || undefined,
      commodity: commodityFilter.trim() || undefined,
    });

    setLoading(false);
    setIsApiConfigured(res.isConfigured);
    setStatusMessage(res.message);

    if (res.success && res.records.length > 0) {
      setRecords(res.records);
    } else {
      setRecords([]);
    }
  };

  const handleSaveApiKey = () => {
    saveStoredDataGovApiKey(apiKeyInput);
    setIsApiConfigured(true);
    setKeySavedMessage('Custom data.gov.in API key successfully registered in session.');
    setIsConfiguringKey(false);
    setTimeout(() => setKeySavedMessage(null), 4000);
    loadPrices();
  };

  const handleResetToDefaultGateway = () => {
    saveStoredDataGovApiKey('');
    setApiKeyInput('');
    setIsConfiguringKey(false);
    setKeySavedMessage('Reset to Official Institutional OGD Gateway.');
    setTimeout(() => setKeySavedMessage(null), 4000);
    loadPrices();
  };

  useEffect(() => {
    loadPrices();
  }, [stateFilter, districtFilter]);

  // States options
  const stateOptions = React.useMemo(() => {
    return OFFICIAL_INDIAN_STATES.map((s) => ({
      label: s.name,
      value: s.name,
      subtext: `${s.type === 'STATE' ? 'State' : 'UT'} • Capital: ${s.capital}`,
    }));
  }, []);

  // Districts options based on selected state
  const districtOptions = React.useMemo(() => {
    const districts = OFFICIAL_STATE_DISTRICTS[stateFilter] || [];
    return districts.map((d) => ({
      label: d,
      value: d,
      subtext: `${stateFilter} District`,
    }));
  }, [stateFilter]);

  // Comprehensive commodities options grouped by category
  const commodityOptions = React.useMemo(() => {
    return AGMARKNET_COMMODITY_CATEGORIES.flatMap((cat) =>
      cat.items.map((item) => ({
        label: item,
        value: item,
        category: cat.category,
      }))
    );
  }, []);

  const handleStateSelect = (newState: string) => {
    setStateFilter(newState);
    const districts = OFFICIAL_STATE_DISTRICTS[newState] || [];
    if (districts.length > 0 && !districts.includes(districtFilter)) {
      setDistrictFilter(districts[0]);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Module Header with Connection Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Official Agmarknet Daily APMC Market Prices
            </h2>
            <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected to Agmarknet OGD Gateway
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Directorate of Marketing & Inspection (DMI), Ministry of Agriculture & Farmers Welfare &bull; Resource ID{' '}
            <code className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono">
              9ef84268-d588-465a-a308-a864a43d0070
            </code>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsConfiguringKey(!isConfiguringKey)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <span>API Gateway Settings</span>
            </button>
          )}
          <button
            type="button"
            onClick={loadPrices}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs transition flex items-center gap-1.5"
            title="Refresh APMC Mandi Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {keySavedMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{keySavedMessage}</span>
        </div>
      )}

      {/* API Key Modal / Form (Admin only) */}
      {isAdmin && isConfiguringKey && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-600" />
                data.gov.in Open Government Data API Authorization
              </h4>
              <p className="text-xs text-slate-500">
                Connected by default via Official Institutional Gateway. You may optionally enter a custom 64-character organizational key from data.gov.in.
              </p>
            </div>
            <a
              href="https://data.gov.in/user/register"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-700 hover:underline flex items-center gap-1 shrink-0 font-medium"
            >
              <span>Get Free Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Paste your 64-character data.gov.in API key..."
              className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
            <button
              type="button"
              onClick={handleSaveApiKey}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
            >
              Save Custom Key
            </button>
            <button
              type="button"
              onClick={handleResetToDefaultGateway}
              className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              Reset to Institutional Key
            </button>
          </div>
        </div>
      )}

      {/* Interactive Search Filters with Options on Press */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SearchableSelect
            label="State Filter"
            value={stateFilter}
            onChange={handleStateSelect}
            options={stateOptions}
            placeholder="Select State or Union Territory..."
            searchPlaceholder="Search 28 States & 8 UTs..."
            helperText="Press to select from official Indian States & UTs"
          />

          <SearchableSelect
            label="District Filter"
            value={districtFilter}
            onChange={(val) => setDistrictFilter(val)}
            options={districtOptions}
            placeholder={stateFilter ? `Select ${stateFilter} District...` : 'Select a State first...'}
            searchPlaceholder={`Search ${stateFilter || 'all'} districts...`}
            disabled={!stateFilter}
            helperText={
              stateFilter
                ? `${districtOptions.length} official administrative districts available`
                : 'Select a State to view districts'
            }
          />

          <SearchableSelect
            label="Agmarknet Commodity"
            value={commodityFilter}
            onChange={(val) => setCommodityFilter(val)}
            options={commodityOptions}
            placeholder="Select Agmarknet Commodity..."
            searchPlaceholder="Search 70+ official Agmarknet commodities..."
            grouped={true}
            helperText="Press to choose from official DMI commodity categories"
          />
        </div>

        {/* Action Row & Quick Select Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Quick Select:</span>
            {POPULAR_COMMODITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCommodityFilter(c);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                  commodityFilter.toLowerCase() === c.toLowerCase()
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={loadPrices}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm ml-auto"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Query Agmarknet APMC Rates</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-500">
          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
          <p className="text-xs font-medium">Querying Agmarknet APMC Mandi Gateway...</p>
        </div>
      )}

      {/* Connected but 0 records reported */}
      {!loading && records.length === 0 && (
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
          <div className="flex items-center space-x-2 text-slate-900 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4>No Live Mandi Transactions Reported for Selected Criteria</h4>
          </div>
          <p className="text-slate-600">
            {statusMessage ||
              `The Agmarknet feed reported zero market transactions for "${commodityFilter}" in ${districtFilter}, ${stateFilter} on the latest recorded arrival cycle.`}
          </p>
          <p className="text-[11px] text-slate-400">
            Zero Demo Data Rule: When mandis are closed on local holidays or haven't transmitted the register, we display
            an honest empty state rather than inventing synthetic numbers.
          </p>
        </div>
      )}

      {/* Real Mandi Table */}
      {!loading && records.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>
                Showing <strong className="text-slate-900">{records.length}</strong> verified APMC market transaction(s):
              </span>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-medium">
                Live Agmarknet Connected
              </span>
            </div>
            <DataProvenanceBadge provenance={records[0].provenance} />
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Market (APMC Mandi)</th>
                  <th className="px-4 py-2.5">District & State</th>
                  <th className="px-4 py-2.5">Commodity (Variety)</th>
                  <th className="px-4 py-2.5">Arrival Date</th>
                  <th className="px-4 py-2.5 text-right">Min (₹/Q)</th>
                  <th className="px-4 py-2.5 text-right">Max (₹/Q)</th>
                  <th className="px-4 py-2.5 text-right font-bold text-emerald-800">Modal Price (₹/Q)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {records.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-2.5 font-medium text-slate-900 font-sans">{r.market}</td>
                    <td className="px-4 py-2.5 text-slate-600 font-sans">
                      {r.district}, {r.state}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 font-sans">
                      {r.commodity} <span className="text-slate-400 text-[11px]">({r.variety})</span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{r.arrivalDate}</td>
                    <td className="px-4 py-2.5 text-right text-slate-600">₹{r.minPrice.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5 text-right text-slate-600">₹{r.maxPrice.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-emerald-700">
                      ₹{r.modalPrice.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
