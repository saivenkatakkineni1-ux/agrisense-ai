/**
 * @license
 * AgriSense AI - Government-Grade Real-Data Agriculture Platform
 * Lead Architect & Executive Owner: Sai Venkat Akkineni
 * Advanced MapLibre GL WebGL Cadastral GIS Engine
 * High-Performance Vector & Sub-Meter Satellite Boundary Mapping
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import {
  Layers,
  MapPin,
  Trash2,
  Undo2,
  ShieldCheck,
  Maximize2,
  Compass,
  Copy,
  Check,
  Download,
  Eye,
  Navigation,
  Globe,
  Mountain,
} from 'lucide-react';

export interface FarmMapProps {
  initialLat?: number;
  initialLon?: number;
  initialZoom?: number;
  existingGeoJson?: string;
  onBoundaryChange?: (boundaryGeoJson: string, areaAcres: number) => void;
  isReadOnly?: boolean;
}

type BasemapStyle = 'satellite' | 'topography' | 'administrative';

// Spherical geodesic polygon area calculation (WGS84 ellipsoid approximation)
function calculateGeodesicArea(coords: [number, number][]): number {
  if (coords.length < 3) return 0;
  const radius = 6378137; // Earth's mean radius in meters
  let total = 0;

  for (let i = 0; i < coords.length; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % coords.length];
    const dLambda = ((p2[0] - p1[0]) * Math.PI) / 180;
    const phi1 = (p1[1] * Math.PI) / 180;
    const phi2 = (p2[1] * Math.PI) / 180;
    total += dLambda * (2 + Math.sin(phi1) + Math.sin(phi2));
  }

  total = (Math.abs(total) * radius * radius) / 2.0;
  return total;
}

// Spherical geodesic distance between 2 points (meters)
function calculateDistanceMeters(p1: [number, number], p2: [number, number]): number {
  const R = 6378137;
  const dLat = ((p2[1] - p1[1]) * Math.PI) / 180;
  const dLon = ((p2[0] - p1[0]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1[1] * Math.PI) / 180) *
      Math.cos((p2[1] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculatePerimeter(coords: [number, number][]): number {
  if (coords.length < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < coords.length; i++) {
    const next = (i + 1) % coords.length;
    perimeter += calculateDistanceMeters(coords[i], coords[next]);
  }
  return perimeter;
}

const BASEMAP_TILES: Record<BasemapStyle, { name: string; tiles: string[]; attribution: string; maxzoom: number }> = {
  satellite: {
    name: 'Satellite HD (Maxar / Esri)',
    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
    attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics, USDA, USGS',
    maxzoom: 19,
  },
  topography: {
    name: 'Topographic & Contours',
    tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
    attribution: 'Map data &copy; OpenStreetMap contributors, SRTM | Map style &copy; OpenTopoMap (CC-BY-SA)',
    maxzoom: 17,
  },
  administrative: {
    name: 'Administrative & Road Network',
    tiles: ['https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'],
    attribution: '&copy; OpenStreetMap contributors, &copy; CARTO',
    maxzoom: 19,
  },
};

export const FarmMap: React.FC<FarmMapProps> = ({
  initialLat = 16.3067,
  initialLon = 80.4365,
  initialZoom = 14,
  existingGeoJson,
  onBoundaryChange,
  isReadOnly = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [vertices, setVertices] = useState<[number, number][]>([]); // [lon, lat]
  const [activeBasemap, setActiveBasemap] = useState<BasemapStyle>('satellite');
  const [is3DMode, setIs3DMode] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<{ lng: number; lat: number } | null>(null);
  const [copiedGeoJson, setCopiedGeoJson] = useState<boolean>(false);
  const [areaAcres, setAreaAcres] = useState<number>(0);
  const [perimeterMeters, setPerimeterMeters] = useState<number>(0);

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'basemap-source': {
          type: 'raster',
          tiles: BASEMAP_TILES[activeBasemap].tiles,
          tileSize: 256,
          attribution: BASEMAP_TILES[activeBasemap].attribution,
          maxzoom: BASEMAP_TILES[activeBasemap].maxzoom,
        },
      },
      layers: [
        {
          id: 'basemap-layer',
          type: 'raster',
          source: 'basemap-source',
          paint: {},
        },
      ],
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [initialLon, initialLat],
      zoom: initialZoom,
      pitch: 0,
      bearing: 0,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.on('mousemove', (e) => {
      setCursorPos({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    });

    map.on('load', () => {
      // Add Polygon GeoJSON Source & Layers
      map.addSource('cadastral-polygon-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Polygon fill layer
      map.addLayer({
        id: 'cadastral-polygon-fill',
        type: 'fill',
        source: 'cadastral-polygon-source',
        paint: {
          'fill-color': '#10b981',
          'fill-opacity': 0.28,
        },
      });

      // Polygon outline layer
      map.addLayer({
        id: 'cadastral-polygon-line',
        type: 'line',
        source: 'cadastral-polygon-source',
        paint: {
          'line-color': '#059669',
          'line-width': 2.5,
          'line-dasharray': [2, 1],
        },
      });

      // Parse existing GeoJSON if passed
      if (existingGeoJson) {
        try {
          const parsed = JSON.parse(existingGeoJson);
          if (parsed.type === 'Feature' && parsed.geometry?.coordinates) {
            const rings = parsed.geometry.coordinates[0];
            if (Array.isArray(rings) && rings.length >= 3) {
              const loadedVertices: [number, number][] = rings
                .slice(0, -1)
                .map((pt: any) => [pt[0], pt[1]]);
              setVertices(loadedVertices);
              map.flyTo({ center: loadedVertices[0], zoom: 16 });
            }
          }
        } catch (e) {
          console.warn('Invalid initial GeoJSON', e);
        }
      }
    });

    if (!isReadOnly) {
      map.on('click', (e) => {
        const newVertex: [number, number] = [
          parseFloat(e.lngLat.lng.toFixed(6)),
          parseFloat(e.lngLat.lat.toFixed(6)),
        ];
        setVertices((prev) => [...prev, newVertex]);
      });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Basemap Switch
  const handleBasemapChange = (style: BasemapStyle) => {
    setActiveBasemap(style);
    const map = mapInstanceRef.current;
    if (!map) return;

    const source = map.getSource('basemap-source') as maplibregl.RasterTileSource;
    if (source) {
      // Update raster tiles dynamically
      const currentZoom = map.getZoom();
      const currentCenter = map.getCenter();
      const currentPitch = map.getPitch();
      const currentBearing = map.getBearing();

      const newStyle: maplibregl.StyleSpecification = {
        version: 8,
        sources: {
          'basemap-source': {
            type: 'raster',
            tiles: BASEMAP_TILES[style].tiles,
            tileSize: 256,
            attribution: BASEMAP_TILES[style].attribution,
            maxzoom: BASEMAP_TILES[style].maxzoom,
          },
        },
        layers: [
          {
            id: 'basemap-layer',
            type: 'raster',
            source: 'basemap-source',
            paint: {},
          },
        ],
      };

      map.setStyle(newStyle);

      map.once('style.load', () => {
        map.setZoom(currentZoom);
        map.setCenter(currentCenter);
        map.setPitch(currentPitch);
        map.setBearing(currentBearing);

        // Re-add Cadastral GeoJSON layers
        if (!map.getSource('cadastral-polygon-source')) {
          map.addSource('cadastral-polygon-source', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [],
            },
          });

          map.addLayer({
            id: 'cadastral-polygon-fill',
            type: 'fill',
            source: 'cadastral-polygon-source',
            paint: {
              'fill-color': '#10b981',
              'fill-opacity': 0.28,
            },
          });

          map.addLayer({
            id: 'cadastral-polygon-line',
            type: 'line',
            source: 'cadastral-polygon-source',
            paint: {
              'line-color': '#059669',
              'line-width': 2.5,
              'line-dasharray': [2, 1],
            },
          });
        }
        updatePolygonOnMap(vertices);
      });
    }
  };

  // Toggle 3D Pitch
  const toggle3DPitch = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const targetPitch = is3DMode ? 0 : 55;
    map.easeTo({ pitch: targetPitch, duration: 800 });
    setIs3DMode(!is3DMode);
  };

  // Update Polygon Geometry & Markers
  const updatePolygonOnMap = useCallback(
    (currentVertices: [number, number][]) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Clean existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Add vertex markers
      currentVertices.forEach((v, idx) => {
        const el = document.createElement('div');
        el.className =
          'w-5 h-5 rounded-full bg-white border-2 border-emerald-600 shadow-md flex items-center justify-center text-[9px] font-bold text-emerald-800 cursor-pointer hover:scale-125 transition transform';
        el.innerText = `${idx + 1}`;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(v)
          .addTo(map);
        markersRef.current.push(marker);
      });

      // Update source
      const source = map.getSource('cadastral-polygon-source') as maplibregl.GeoJSONSource;
      if (source) {
        if (currentVertices.length >= 3) {
          const closedCoords = [...currentVertices, currentVertices[0]];
          const geoJsonFeature = {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {
                  areaAcres: areaAcres,
                  leadArchitect: 'Sai Venkat Akkineni',
                },
                geometry: {
                  type: 'Polygon',
                  coordinates: [closedCoords],
                },
              },
            ],
          };
          source.setData(geoJsonFeature as any);
        } else if (currentVertices.length === 2) {
          source.setData({
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: currentVertices,
                },
              },
            ],
          } as any);
        } else {
          source.setData({
            type: 'FeatureCollection',
            features: [],
          });
        }
      }
    },
    [areaAcres]
  );

  // Sync calculation & propagation
  useEffect(() => {
    if (vertices.length >= 3) {
      const areaSqM = calculateGeodesicArea(vertices);
      const acres = parseFloat((areaSqM / 4046.8564224).toFixed(3));
      const perimeterM = Math.round(calculatePerimeter(vertices));
      setAreaAcres(acres);
      setPerimeterMeters(perimeterM);

      const closed = [...vertices, vertices[0]];
      const geoJsonString = JSON.stringify({
        type: 'Feature',
        properties: {
          areaAcres: acres,
          perimeterMeters: perimeterM,
          surveyTimestamp: new Date().toISOString(),
          gisEngine: 'MapLibre GL WebGL Engine',
          executiveOwner: 'Sai Venkat Akkineni',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [closed],
        },
      });

      if (onBoundaryChange) {
        onBoundaryChange(geoJsonString, acres);
      }
    } else {
      setAreaAcres(0);
      setPerimeterMeters(0);
      if (onBoundaryChange) {
        onBoundaryChange('', 0);
      }
    }

    updatePolygonOnMap(vertices);
  }, [vertices, onBoundaryChange, updatePolygonOnMap]);

  const handleUndo = () => {
    setVertices((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setVertices([]);
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      if (vertices.length > 0) {
        mapInstanceRef.current.flyTo({ center: vertices[0], zoom: 16 });
      } else {
        mapInstanceRef.current.flyTo({ center: [initialLon, initialLat], zoom: initialZoom });
      }
    }
  };

  const handleCopyGeoJson = () => {
    if (vertices.length < 3) return;
    const closed = [...vertices, vertices[0]];
    const data = JSON.stringify(
      {
        type: 'Feature',
        properties: {
          areaAcres,
          perimeterMeters,
          executiveOwner: 'Sai Venkat Akkineni',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [closed],
        },
      },
      null,
      2
    );
    navigator.clipboard.writeText(data);
    setCopiedGeoJson(true);
    setTimeout(() => setCopiedGeoJson(false), 3000);
  };

  const handleDownloadGeoJson = () => {
    if (vertices.length < 3) return;
    const closed = [...vertices, vertices[0]];
    const data = JSON.stringify(
      {
        type: 'Feature',
        properties: {
          areaAcres,
          perimeterMeters,
          surveyDate: new Date().toISOString(),
          executiveOwner: 'Sai Venkat Akkineni',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [closed],
        },
      },
      null,
      2
    );
    const blob = new Blob([data], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cadastral_parcel_${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-md bg-slate-900">
      {/* MapLibre Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Left: Basemap & Projection Switcher HUD */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-1.5 shadow-lg">
        <button
          type="button"
          onClick={() => handleBasemapChange('satellite')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeBasemap === 'satellite'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Satellite HD</span>
        </button>

        <button
          type="button"
          onClick={() => handleBasemapChange('topography')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeBasemap === 'topography'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Mountain className="w-3.5 h-3.5" />
          <span>Topography</span>
        </button>

        <button
          type="button"
          onClick={() => handleBasemapChange('administrative')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeBasemap === 'administrative'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Admin Boundaries</span>
        </button>

        <div className="w-[1px] h-5 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={toggle3DPitch}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            is3DMode
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Toggle 3D Terrain Angle"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{is3DMode ? '3D Active (55°)' : '3D View'}</span>
        </button>
      </div>

      {/* Top Right: Cadastral Survey Controls */}
      {!isReadOnly && (
        <div className="absolute top-3 right-14 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-1.5 shadow-lg">
          <button
            type="button"
            onClick={handleUndo}
            disabled={vertices.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition"
            title="Undo Last Survey Vertex"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={vertices.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition"
            title="Reset Parcel Boundary"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <button
            type="button"
            onClick={handleRecenter}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
            title="Fly to Parcel"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Recenter</span>
          </button>
        </div>
      )}

      {/* Bottom Center: Area & Perimeter Telemetry HUD */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-wrap items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 text-white rounded-xl px-4 py-2.5 shadow-xl text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">Cadastral Survey:</span>
          <span className="font-mono bg-emerald-950 border border-emerald-700 text-emerald-300 px-2 py-0.5 rounded font-bold">
            {vertices.length} Vertices
          </span>
        </div>

        <div className="w-[1px] h-4 bg-slate-700" />

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Calculated Area:</span>
          <span className="font-mono text-emerald-400 font-extrabold text-sm">
            {areaAcres.toLocaleString()} ac
          </span>
          <span className="text-slate-400 text-[11px]">
            ({(areaAcres * 0.404686).toFixed(3)} ha)
          </span>
        </div>

        {perimeterMeters > 0 && (
          <>
            <div className="w-[1px] h-4 bg-slate-700" />
            <div className="flex items-center gap-1 text-slate-300">
              <span className="text-slate-400">Perimeter:</span>
              <span className="font-mono font-semibold">
                {perimeterMeters > 1000
                  ? `${(perimeterMeters / 1000).toFixed(2)} km`
                  : `${perimeterMeters} m`}
              </span>
            </div>
          </>
        )}

        {vertices.length >= 3 && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
            <button
              type="button"
              onClick={handleCopyGeoJson}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition flex items-center gap-1 text-[11px]"
              title="Copy Standard RFC 7946 GeoJSON"
            >
              {copiedGeoJson ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>GeoJSON</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadGeoJson}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
              title="Download GeoJSON File"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Right: Cursor Coordinates HUD */}
      {cursorPos && (
        <div className="absolute bottom-2 right-2 z-10 bg-slate-900/85 backdrop-blur-sm border border-slate-700 text-slate-300 rounded-md px-2.5 py-1 text-[11px] font-mono select-none">
          {cursorPos.lat.toFixed(6)}° N, {cursorPos.lng.toFixed(6)}° E &bull; WebGL 60fps
        </div>
      )}

      {/* Drawing Instructions Overlay when 0 or 1 vertex */}
      {!isReadOnly && vertices.length < 3 && (
        <div className="absolute top-16 left-3 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2 pointer-events-none">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>
            {vertices.length === 0
              ? 'Click anywhere on the satellite image to plot your first cadastral boundary peg.'
              : 'Click additional field corners to construct the cadastral boundary.'}
          </span>
        </div>
      )}
    </div>
  );
};
