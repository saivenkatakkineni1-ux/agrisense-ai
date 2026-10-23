/**
 * @license
 * AgriSense AI - Government-Grade Real-Data Agriculture Platform
 * Farmer-to-Buyer Direct Agricultural Marketplace
 * Clean Enterprise UI & Zero Demo Data
 * Strict Restrictions: Zero Payments / Gateways / Loans / EMI
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  addDoc,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase/config';
import { OFFICIAL_INDIAN_STATES, OFFICIAL_STATE_DISTRICTS } from '../services/indiaLocationService';
import { AGMARKNET_COMMODITY_CATEGORIES, ALL_AGMARKNET_COMMODITIES } from '../data/agmarknetCommodities';
import { SearchableSelect } from './SearchableSelect';
import {
  ShoppingBag,
  Plus,
  MessageSquare,
  MapPin,
  Calendar,
  CheckCircle2,
  Loader2,
  Tag,
  Send,
  Building,
  Filter,
  X,
} from 'lucide-react';

export interface MarketListing {
  id?: string;
  farmerId: string;
  farmerName: string;
  farmId: string;
  cropName: string;
  variety: string;
  quantityKg: number;
  expectedPricePerKg: number;
  state: string;
  district: string;
  village: string;
  harvestDate: string;
  status: 'AVAILABLE' | 'COMMITTED' | 'FULFILLED' | 'WITHDRAWN';
  createdAt: string;
}

export interface BuyerEnquiry {
  id?: string;
  listingId: string;
  farmerId: string;
  buyerId: string;
  buyerName: string;
  buyerOrganization: string;
  offeredPricePerKg: number;
  quantityRequiredKg: number;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
}

interface MarketplaceModuleProps {
  currentUserRole?: string;
}

export const MarketplaceModule: React.FC<MarketplaceModuleProps> = () => {
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreatingListing, setIsCreatingListing] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [cropName, setCropName] = useState<string>('Paddy (Rice)');
  const [variety, setVariety] = useState<string>('BPT 5204 (Sona Masoori)');
  const [quantityKg, setQuantityKg] = useState<number>(2000);
  const [pricePerKg, setPricePerKg] = useState<number>(24);
  const [state, setState] = useState<string>('Andhra Pradesh');
  const [district, setDistrict] = useState<string>('Guntur');
  const [village, setVillage] = useState<string>('Tenali');
  const [harvestDate, setHarvestDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [selectedListingForEnquiry, setSelectedListingForEnquiry] = useState<MarketListing | null>(null);
  const [enquiryBuyerOrg, setEnquiryBuyerOrg] = useState<string>('Rythu Producer Company Ltd.');
  const [enquiryOfferedPrice, setEnquiryOfferedPrice] = useState<number>(25);
  const [enquiryQuantity, setEnquiryQuantity] = useState<number>(1000);
  const [enquiryMessage, setEnquiryMessage] = useState<string>('');
  const [enquirySubmitting, setEnquirySubmitting] = useState<boolean>(false);

  // Filter states
  const [filterState, setFilterState] = useState<string>('');
  const [filterDistrict, setFilterDistrict] = useState<string>('');
  const [filterCommodity, setFilterCommodity] = useState<string>('');

  // States and Districts for form and filter
  const stateOptions = useMemo(() => {
    return OFFICIAL_INDIAN_STATES.map((s) => ({
      label: s.name,
      value: s.name,
      subtext: `${s.type === 'STATE' ? 'State' : 'UT'} • Capital: ${s.capital}`,
    }));
  }, []);

  const formDistrictOptions = useMemo(() => {
    return (OFFICIAL_STATE_DISTRICTS[state] || []).map((d) => ({
      label: d,
      value: d,
    }));
  }, [state]);

  const filterDistrictOptions = useMemo(() => {
    if (!filterState) return [];
    return (OFFICIAL_STATE_DISTRICTS[filterState] || []).map((d) => ({
      label: d,
      value: d,
    }));
  }, [filterState]);

  const commodityOptions = useMemo(() => {
    return AGMARKNET_COMMODITY_CATEGORIES.flatMap((cat) =>
      cat.items.map((item) => ({
        label: item,
        value: item,
        category: cat.category,
      }))
    );
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (filterState && item.state.toLowerCase() !== filterState.toLowerCase()) return false;
      if (filterDistrict && item.district.toLowerCase() !== filterDistrict.toLowerCase()) return false;
      if (filterCommodity && !item.cropName.toLowerCase().includes(filterCommodity.toLowerCase())) return false;
      return true;
    });
  }, [listings, filterState, filterDistrict, filterCommodity]);

  useEffect(() => {
    setLoading(true);
    const listingsCol = collection(db, 'market_listings');
    const q = query(listingsCol, where('status', '==', 'AVAILABLE'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: MarketListing[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<MarketListing, 'id'>) });
        });
        setListings(list);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        handleFirestoreError(err, OperationType.GET, 'market_listings');
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      setStatusMessage('Please sign in to publish verified produce offerings.');
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    const newListing: Omit<MarketListing, 'id'> = {
      farmerId: user.uid,
      farmerName: user.displayName || 'Authorized Farmer',
      farmId: 'farm_' + Date.now(),
      cropName: cropName.trim(),
      variety: variety.trim(),
      quantityKg,
      expectedPricePerKg: pricePerKg,
      state: state.trim(),
      district: district.trim(),
      village: village.trim(),
      harvestDate,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'market_listings'), newListing);
      setSubmitting(false);
      setIsCreatingListing(false);
      setStatusMessage('Produce listing published to verified marketplace.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setSubmitting(false);
      handleFirestoreError(err, OperationType.CREATE, 'market_listings');
    }
  };

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !selectedListingForEnquiry?.id) {
      setStatusMessage('Authentication required to submit procurement enquiries.');
      return;
    }

    setEnquirySubmitting(true);
    const newEnquiry: Omit<BuyerEnquiry, 'id'> = {
      listingId: selectedListingForEnquiry.id,
      farmerId: selectedListingForEnquiry.farmerId,
      buyerId: user.uid,
      buyerName: user.displayName || 'Authorized FPO Buyer',
      buyerOrganization: enquiryBuyerOrg.trim(),
      offeredPricePerKg: enquiryOfferedPrice,
      quantityRequiredKg: enquiryQuantity,
      message: enquiryMessage.trim() || 'Direct institutional procurement enquiry.',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'buyer_enquiries'), newEnquiry);
      setEnquirySubmitting(false);
      setSelectedListingForEnquiry(null);
      setEnquiryMessage('');
      setStatusMessage('Procurement trade enquiry transmitted directly to the farmer.');
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err) {
      setEnquirySubmitting(false);
      handleFirestoreError(err, OperationType.CREATE, 'buyer_enquiries');
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Verified Farmer-to-Buyer Agricultural Marketplace
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct Trade Enquiries &bull; Zero Brokerage &bull; Zero Synthetic Listings &bull; No Payment Gateways
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreatingListing(!isCreatingListing)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreatingListing ? 'Close Form' : 'Publish Produce Listing'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Produce Listing Form */}
      {isCreatingListing && (
        <form onSubmit={handleCreateListing} className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Publish Harvest Lot for Direct Buyer Enquiries
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <SearchableSelect
              label="Crop Commodity"
              required
              value={cropName}
              onChange={setCropName}
              options={commodityOptions}
              grouped={true}
              placeholder="Select Agmarknet Commodity..."
              searchPlaceholder="Search 70+ commodities..."
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Variety / Cultivar *</label>
              <input
                type="text"
                required
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="e.g. Sona Masoori, Sharbati"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Available Quantity (kg) *</label>
              <input
                type="number"
                min="10"
                step="10"
                required
                value={quantityKg}
                onChange={(e) => setQuantityKg(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Price (₹ / kg) *</label>
              <input
                type="number"
                min="1"
                step="0.5"
                required
                value={pricePerKg}
                onChange={(e) => setPricePerKg(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <SearchableSelect
              label="State"
              required
              value={state}
              onChange={(val) => {
                setState(val);
                const dists = OFFICIAL_STATE_DISTRICTS[val] || [];
                if (dists.length > 0 && !dists.includes(district)) setDistrict(dists[0]);
              }}
              options={stateOptions}
              placeholder="Select State..."
              searchPlaceholder="Search 28 States & 8 UTs..."
            />

            <SearchableSelect
              label="District"
              required
              value={district}
              onChange={setDistrict}
              options={formDistrictOptions}
              placeholder={state ? `Select ${state} District...` : 'Select state first'}
              searchPlaceholder="Search districts..."
              disabled={!state}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Village / Yard *</label>
              <input
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Tenali, Guntur H.O"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Availability Date *</label>
              <input
                type="date"
                required
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>Publish Live Listing</span>
            </button>
          </div>
        </form>
      )}

      {/* Marketplace Filter Ribbon (State, District, Commodity options on press) */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>Filter Marketplace Lots by State, District, &amp; Commodity</span>
          </div>
          {(filterState || filterDistrict || filterCommodity) && (
            <button
              type="button"
              onClick={() => {
                setFilterState('');
                setFilterDistrict('');
                setFilterCommodity('');
              }}
              className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
            >
              <X className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SearchableSelect
            label="State Filter"
            value={filterState}
            onChange={(val) => {
              setFilterState(val);
              setFilterDistrict('');
            }}
            options={stateOptions}
            placeholder="All States & UTs"
            searchPlaceholder="Search 28 States & 8 UTs..."
            helperText="Press to filter lots by State"
          />

          <SearchableSelect
            label="District Filter"
            value={filterDistrict}
            onChange={setFilterDistrict}
            options={filterDistrictOptions}
            placeholder={filterState ? `All ${filterState} Districts` : 'Select a State first'}
            searchPlaceholder="Search districts..."
            disabled={!filterState}
            helperText="Press to filter lots by District"
          />

          <SearchableSelect
            label="Commodity Filter"
            value={filterCommodity}
            onChange={setFilterCommodity}
            options={commodityOptions}
            placeholder="All Commodities"
            searchPlaceholder="Search commodities..."
            grouped={true}
            helperText="Press to filter by Agmarknet crop"
          />
        </div>
      </div>

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-500">
          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
          <p className="text-xs font-medium">Loading verified harvest offerings from Cloud Firestore...</p>
        </div>
      )}

      {!loading && filteredListings.length === 0 && (
        <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
          <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900">
            {listings.length === 0 ? 'No Verified Produce Listings Published' : 'No Listings Match the Active Filters'}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {listings.length === 0
              ? 'Zero Demo Data Rule: This marketplace contains zero synthetic listings or mock farmer inventories. Authentic harvest lots will appear here immediately once submitted by registered farmers.'
              : 'Try clearing the State, District, or Commodity filters to view all available harvest lots.'}
          </p>
          {listings.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setFilterState('');
                setFilterDistrict('');
                setFilterCommodity('');
              }}
              className="mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {!loading && filteredListings.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>
              Showing <strong className="text-slate-900">{filteredListings.length}</strong> of{' '}
              <strong className="text-slate-900">{listings.length}</strong> verified harvest listing(s):
            </span>
            <span className="font-mono text-[11px] text-slate-400">Cloud Firestore /market_listings</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.cropName}</h4>
                      <span className="text-xs text-emerald-700 font-semibold">{item.variety}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {item.village}, {item.district}, {item.state}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-slate-200 font-mono text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans">Available Stock</span>
                      <strong className="text-slate-900 font-bold">{item.quantityKg.toLocaleString('en-IN')} kg</strong>
                      <span className="text-slate-500 text-[10px] block">
                        ({(item.quantityKg / 100).toFixed(1)} Q)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans">Expected Price</span>
                      <strong className="text-emerald-700 font-bold text-sm">₹{item.expectedPricePerKg} / kg</strong>
                      <span className="text-slate-500 text-[10px] block">
                        (₹{(item.expectedPricePerKg * 100).toLocaleString('en-IN')} / Q)
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Harvest: {item.harvestDate}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Farmer: {item.farmerName}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedListingForEnquiry(item)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send Enquiry</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trade Enquiry Modal */}
      {selectedListingForEnquiry && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-600" />
              Direct Buyer Procurement Enquiry
            </h3>

            <p className="text-xs text-slate-500">
              Produce: <strong className="text-slate-900">{selectedListingForEnquiry.cropName}</strong> (
              {selectedListingForEnquiry.variety}) &bull; Stock: {selectedListingForEnquiry.quantityKg} kg
            </p>

            <form onSubmit={handleSendEnquiry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Procuring FPO / Corporate Buyer Name
                </label>
                <input
                  type="text"
                  required
                  value={enquiryBuyerOrg}
                  onChange={(e) => setEnquiryBuyerOrg(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Offered Price (₹ / kg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={enquiryOfferedPrice}
                    onChange={(e) => setEnquiryOfferedPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantity Required (kg)
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    required
                    value={enquiryQuantity}
                    onChange={(e) => setEnquiryQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Procurement & Quality Terms
                </label>
                <textarea
                  rows={3}
                  value={enquiryMessage}
                  onChange={(e) => setEnquiryMessage(e.target.value)}
                  placeholder="e.g. Farm-gate pickup with moisture testing under 14%."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedListingForEnquiry(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enquirySubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {enquirySubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Submit Trade Enquiry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
