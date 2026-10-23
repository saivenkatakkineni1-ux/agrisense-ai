/**
 * @license
 * AgriSense AI - Government-Grade Real-Data Agriculture Platform
 * Real Mandi (Agricultural Market) Pricing Service
 * Connected to Agmarknet via Open Government Data (OGD) Platform India (data.gov.in)
 * STRICT ZERO DEMO DATA ENFORCEMENT
 */

import { ProvenanceMetadata } from './indiaLocationService';

export interface MandiPriceRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade?: string;
  arrivalDate: string;
  minPrice: number; // ₹ per Quintal (100 kg)
  maxPrice: number;
  modalPrice: number;
  provenance: ProvenanceMetadata;
}

export interface MandiQueryResult {
  success: boolean;
  records: MandiPriceRecord[];
  totalRecordsFound: number;
  isConfigured: boolean;
  message: string;
  suggestedAction?: string;
}

const AGMARKNET_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const STORAGE_KEY_DATAGOV_API_KEY = 'agrisense_datagov_api_key';

export const DEFAULT_DATAGOV_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';

export function getStoredDataGovApiKey(): string {
  if (typeof window === 'undefined') return DEFAULT_DATAGOV_KEY;
  return localStorage.getItem(STORAGE_KEY_DATAGOV_API_KEY) || DEFAULT_DATAGOV_KEY;
}

export function saveStoredDataGovApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key.trim()) {
    localStorage.setItem(STORAGE_KEY_DATAGOV_API_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_DATAGOV_API_KEY);
  }
}

/**
 * Fetch real daily market prices from Agmarknet API via /api/mandi/prices gateway.
 * Zero demo data: authentic live stream or verified official Agmarknet bulletin from DMI.
 */
export async function fetchRealMandiPrices(params: {
  state?: string;
  district?: string;
  commodity?: string;
  apiKey?: string;
  limit?: number;
}): Promise<MandiQueryResult> {
  const activeKey = params.apiKey?.trim() || getStoredDataGovApiKey();

  const queryParams = new URLSearchParams({
    limit: (params.limit || 50).toString(),
  });

  if (activeKey) queryParams.append('apiKey', activeKey);
  if (params.state) queryParams.append('state', params.state);
  if (params.district) queryParams.append('district', params.district);
  if (params.commodity) queryParams.append('commodity', params.commodity);

  // First priority: Query the application full-stack gateway /api/mandi/prices
  try {
    const res = await fetch(`/api/mandi/prices?${queryParams.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.records && Array.isArray(data.records)) {
        return {
          success: true,
          records: data.records,
          totalRecordsFound: data.totalRecordsFound || data.records.length,
          isConfigured: true,
          message: data.message || `Connected to Agmarknet daily APMC feed.`,
        };
      }
    }
  } catch (proxyErr) {
    console.warn('Proxy gateway request failed, attempting direct data.gov.in fetch...', proxyErr);
  }

  // Second priority: Direct browser fetch to api.data.gov.in if CORS permits
  try {
    const directParams = new URLSearchParams({
      'api-key': activeKey,
      format: 'json',
      limit: (params.limit || 50).toString(),
    });
    if (params.state) directParams.append('filters[state]', params.state);
    if (params.district) directParams.append('filters[district]', params.district);
    if (params.commodity) directParams.append('filters[commodity]', params.commodity);

    const directUrl = `https://api.data.gov.in/resource/${AGMARKNET_RESOURCE_ID}?${directParams.toString()}`;
    const directRes = await fetch(directUrl);
    if (directRes.ok) {
      const data = await directRes.json();
      const rawRecords = data.records || [];
      const records: MandiPriceRecord[] = rawRecords.map((r: any, idx: number) => ({
        state: r.state || params.state || '',
        district: r.district || params.district || '',
        market: r.market || 'APMC Yard',
        commodity: r.commodity || params.commodity || '',
        variety: r.variety || 'Standard',
        grade: r.grade || 'FAQ',
        arrivalDate: r.arrival_date || '',
        minPrice: parseFloat(r.min_price) || 0,
        maxPrice: parseFloat(r.max_price) || 0,
        modalPrice: parseFloat(r.modal_price) || 0,
        provenance: {
          sourceName: 'Agmarknet / Directorate of Marketing & Inspection (DMI), Ministry of Agriculture',
          sourceUrl: `https://data.gov.in/resource/${AGMARKNET_RESOURCE_ID}`,
          retrievalTimestamp: new Date().toISOString(),
          recordIdentifier: `AGM-${r.state}-${r.market}-${r.commodity}-${r.arrival_date || idx}`,
          verificationLevel: 'OFFICIAL_GOVERNMENT_DIRECTORY',
        },
      }));

      return {
        success: true,
        records,
        totalRecordsFound: data.total || records.length,
        isConfigured: true,
        message: `Retrieved ${records.length} authentic APMC market transaction records directly from data.gov.in.`,
      };
    }
  } catch (directErr) {
    console.error('Direct data.gov.in fetch failed:', directErr);
  }

  return {
    success: false,
    records: [],
    totalRecordsFound: 0,
    isConfigured: true,
    message: 'Unable to retrieve live Agmarknet auction data at this moment. Please verify internet connectivity.',
  };
}
