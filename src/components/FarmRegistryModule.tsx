/**
 * @license
 * AgriSense AI - Government-Grade Real-Data Agriculture Platform
 * Farm Cadastral Registration & Land Parcel Management Module
 * Synchronized with Cloud Firestore (Zero Demo Data)
 */

import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase/config';
import { IndiaLocationSelector, SelectedLocationData } from './IndiaLocationSelector';
import { FarmMap } from './FarmMap';
import {
  Landmark,
  Plus,
  MapPin,
  CheckCircle2,
  FileCheck,
  Loader2,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export interface FarmRecord {
  id?: string;
  farmerId: string;
  farmName: string;
  state: string;
  district: string;
  subDistrict?: string;
  village: string;
  pincode: string;
  latitude: number;
  longitude: number;
  boundaryGeoJson: string;
  totalAreaAcres: number;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
  updatedAt?: string;
}

interface FarmRegistryModuleProps {
  currentUserRole?: string;
  onSelectFarmForAnalysis?: (farm: FarmRecord) => void;
}

export const FarmRegistryModule: React.FC<FarmRegistryModuleProps> = ({
  currentUserRole = 'FARMER',
  onSelectFarmForAnalysis,
}) => {
  const [farms, setFarms] = useState<FarmRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRegisteringNew, setIsRegisteringNew] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [farmName, setFarmName] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocationData>({
    state: 'Andhra Pradesh',
    district: 'Guntur',
    village: 'Guntur H.O',
    pincode: '522002',
    latitude: 16.3067,
    longitude: 80.4365,
    provenance: {
      sourceName: 'Department of Posts, Ministry of Communications, Govt. of India',
      sourceUrl: 'https://api.postalpincode.in/pincode/522002',
      retrievalTimestamp: new Date().toISOString(),
      verificationLevel: 'OFFICIAL_GOVERNMENT_DIRECTORY',
    },
  });
  const [boundaryGeoJson, setBoundaryGeoJson] = useState<string>('');
  const [calculatedAreaAcres, setCalculatedAreaAcres] = useState<number>(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const farmsCol = collection(db, 'farms');
    const q =
      currentUserRole === 'GOVT_OFFICER' || currentUserRole === 'SYSTEM_ADMIN'
        ? query(farmsCol)
        : query(farmsCol, where('farmerId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: FarmRecord[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<FarmRecord, 'id'>) });
        });
        setFarms(list);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        handleFirestoreError(err, OperationType.GET, 'farms');
      }
    );

    return () => unsubscribe();
  }, [currentUserRole]);

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      setStatusMessage('Please sign in to record verified agricultural parcels.');
      return;
    }

    if (!farmName.trim()) {
      setStatusMessage('Please specify a title for this land parcel.');
      return;
    }

    if (!calculatedAreaAcres || calculatedAreaAcres <= 0) {
      setStatusMessage('Mark at least 3 vertices on the satellite map to define polygon boundaries.');
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    const newFarm: Omit<FarmRecord, 'id'> = {
      farmerId: user.uid,
      farmName: farmName.trim(),
      state: selectedLocation.state,
      district: selectedLocation.district,
      subDistrict: selectedLocation.subDistrict || selectedLocation.district,
      village: selectedLocation.village,
      pincode: selectedLocation.pincode,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      boundaryGeoJson,
      totalAreaAcres: calculatedAreaAcres,
      verificationStatus: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'farms'), newFarm);
      setSubmitting(false);
      setIsRegisteringNew(false);
      setFarmName('');
      setBoundaryGeoJson('');
      setCalculatedAreaAcres(0);
      setStatusMessage('Agricultural parcel submitted for cadastral verification.');
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err) {
      setSubmitting(false);
      handleFirestoreError(err, OperationType.CREATE, 'farms');
    }
  };

  const handleVerifyFarm = async (farmId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const farmRef = doc(db, 'farms', farmId);
      await updateDoc(farmRef, {
        verificationStatus: status,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `farms/${farmId}`);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Landmark className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Verified Farm Registry & Geospatial Cadastre
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            WGS-84 Cadastral Boundaries &bull; Cloud Firestore Database &bull; Zero Fabricated Records
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRegisteringNew(!isRegisteringNew)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{isRegisteringNew ? 'Close Form' : 'Register New Farm Parcel'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Registration Form */}
      {isRegisteringNew && (
        <form onSubmit={handleCreateFarm} className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              New Cadastral Parcel Registration Form
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Land Parcel / Farm Name
              </label>
              <input
                type="text"
                required
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder="e.g. Sri Venkateswara Organic Farmland - Sector 4"
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            {/* Location Selector embedded */}
            <IndiaLocationSelector
              onLocationSelected={(loc) => setSelectedLocation(loc)}
              defaultState={selectedLocation.state}
              defaultDistrict={selectedLocation.district}
            />

            {/* Geospatial Map */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Plot Parcel Boundary on Satellite Imagery (Click map to add corner vertices)
              </label>
              <FarmMap
                initialLat={selectedLocation.latitude}
                initialLon={selectedLocation.longitude}
                initialZoom={15}
                onBoundaryChange={(geoJson, acres) => {
                  setBoundaryGeoJson(geoJson);
                  setCalculatedAreaAcres(acres);
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-600">
                Calculated Geodesic Area:{' '}
                <strong className="text-slate-900 font-mono text-sm">{calculatedAreaAcres}</strong> Acres
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Save to Cloud Firestore</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-500">
          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
          <p className="text-xs font-medium">Fetching verified land parcels from Cloud Firestore...</p>
        </div>
      )}

      {!loading && farms.length === 0 && (
        <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
          <Landmark className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900">No Registered Farm Parcels</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Zero Demo Data Rule: This database contains zero synthetic records. Register your first authentic land parcel
            above to begin tracking agronomic telemetry.
          </p>
        </div>
      )}

      {!loading && farms.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>
              Showing <strong className="text-slate-900">{farms.length}</strong> registered land parcel(s):
            </span>
            <span className="font-mono text-[11px] text-slate-400">Cloud Firestore /farms</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {farms.map((f) => (
              <div
                key={f.id}
                className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{f.farmName}</h4>
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {f.village}, {f.district}, {f.state} - {f.pincode}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                      f.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : f.verificationStatus === 'REJECTED'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {f.verificationStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-slate-200 font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">Cadastral Area</span>
                    <strong className="text-slate-900 font-bold">{f.totalAreaAcres} Acres</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">Centroid GPS</span>
                    <span className="text-slate-700 text-[11px]">
                      {f.latitude.toFixed(4)}°, {f.longitude.toFixed(4)}°
                    </span>
                  </div>
                </div>

                {f.boundaryGeoJson && (
                  <div className="rounded-lg overflow-hidden border border-slate-200">
                    <FarmMap
                      initialLat={f.latitude}
                      initialLon={f.longitude}
                      initialZoom={16}
                      existingGeoJson={f.boundaryGeoJson}
                      isReadOnly={true}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                  <span>Registered: {new Date(f.createdAt).toLocaleDateString('en-IN')}</span>

                  <div className="flex items-center gap-2">
                    {onSelectFarmForAnalysis && (
                      <button
                        type="button"
                        onClick={() => onSelectFarmForAnalysis(f)}
                        className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-0.5"
                      >
                        <span>Analyze Weather</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {(currentUserRole === 'GOVT_OFFICER' || currentUserRole === 'SYSTEM_ADMIN') &&
                      f.verificationStatus === 'PENDING' && (
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            type="button"
                            onClick={() => f.id && handleVerifyFarm(f.id, 'VERIFIED')}
                            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => f.id && handleVerifyFarm(f.id, 'REJECTED')}
                            className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-[11px]"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
