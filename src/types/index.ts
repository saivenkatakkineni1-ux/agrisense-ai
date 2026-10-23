export type UserRole = 'farmer' | 'buyer' | 'officer' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  state?: string;
  district?: string;
  kisanId?: string; // Kisan Credit / PM-Kisan ID if verified
  organization?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Farm {
  id: string;
  ownerId: string;
  ownerName: string;
  farmName: string;
  state: string;
  district: string;
  taluk?: string;
  village?: string;
  surveyNumber?: string;
  areaAcres: number;
  soilType: string;
  irrigationType: string;
  currentCrop?: string;
  coordinates: string; // GeoJSON or comma-separated vertices
  verifiedByOfficial?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface MarketListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerRole?: string;
  commodity: string;
  variety: string;
  quantityQuintals: number;
  expectedPricePerQuintal: number;
  mandiBenchmarkPrice?: number;
  mandiBenchmarkSource?: string;
  state: string;
  district: string;
  harvestDate?: string;
  status: 'active' | 'sold' | 'delisted';
  contactEmail?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BuyerInquiry {
  id: string;
  listingId: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail?: string;
  offeredPricePerQuintal?: number;
  quantityRequested?: number;
  message: string;
  status: 'submitted' | 'accepted' | 'declined';
  createdAt: string;
}

export interface CropDiagnosisRecord {
  id: string;
  userId: string;
  crop: string;
  suspectedIssue?: string;
  modelUsed: string;
  datasetAttribution: string;
  confidenceScore: number;
  scientificObservations: string;
  recommendedMeasures: string;
  disclaimer: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorId: string;
  actorEmail?: string;
  actorRole: string;
  targetEntity?: string;
  details: string;
  timestamp: string;
}

export interface ProvenanceMetadata {
  providerName: string;
  sourceUrl?: string;
  observationDate: string;
  retrievedAt: string;
  dataClassification: 'Observed Measurement' | 'Official Gazette Benchmark' | 'Agronomic Algorithm' | 'AI Inference';
  units: string;
  confidenceOrMargin?: string;
  coverage: string;
  license: string;
}

export interface LiveWeatherData {
  latitude: number;
  longitude: number;
  elevation: number;
  locationName: string;
  temperatureC: number;
  apparentTempC: number;
  relativeHumidityPercent: number;
  precipitationMm: number;
  windSpeedKmh: number;
  weatherCode: number;
  weatherDescription: string;
  dailyForecast: {
    date: string;
    maxTempC: number;
    minTempC: number;
    precipitationSumMm: number;
    precipitationProbPercent: number;
  }[];
  provenance: ProvenanceMetadata;
}

export interface MandiPriceRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  source: string;
  retrievedAt: string;
}
