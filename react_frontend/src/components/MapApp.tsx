import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { sightingsAPI } from '../api';
import type { Sighting } from '../types';
import RoutingMachine from './RoutingMachine';

// Fix Leaflet default marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom sport marker icon
const createSportIcon = (sport: string) => {
  const sportEmojis: { [key: string]: string } = {
    'basketball': '🏀',
    'football': '🏈',
    'soccer': '⚽',
    'tennis': '🎾',
    'baseball': '⚾',
    'golf': '⛳',
    'swimming': '🏊',
    'cycling': '🚴',
    'running': '🏃',
    'volleyball': '🏐',
    'hockey': '🏒',
    'cricket': '🏏',
    'rugby': '🏉',
    'boxing': '🥊',
    'wrestling': '🤼',
    'archery': '🏹',
    'bowling': '🎳',
    'surfing': '🏄',
  };

  const emoji = sportEmojis[sport.toLowerCase()] || '🏆';

  return L.divIcon({
    html: `<div style="font-size: 28px; filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5));">${emoji}</div>`,
    className: 'sport-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Component to handle map center updates
const MapCenterController: React.FC<{ 
  center: [number, number] | null;
  flyTo: [number, number] | null;
  onFlyComplete?: () => void;
}> = ({ center, flyTo, onFlyComplete }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);

  useEffect(() => {
    if (flyTo) {
      map.flyTo(flyTo, 16, { duration: 1.5 });
      if (onFlyComplete) {
        setTimeout(onFlyComplete, 1500);
      }
    }
  }, [flyTo, map, onFlyComplete]);
  
  return null;
};

type ViewMode = 'community' | 'mine';

const MapApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.006]); // Default: NYC
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('community');
  const [sportFilter, setSportFilter] = useState<string>('');
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Sighting[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [flyToLocation, setFlyToLocation] = useState<[number, number] | null>(null);
  const [isLoadingSightings, setIsLoadingSightings] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [routeDestination, setRouteDestination] = useState<[number, number] | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; time: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user's location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Fetch sightings based on view mode
  useEffect(() => {
    const fetchSightings = async () => {
      setIsLoadingSightings(true);
      try {
        const data = viewMode === 'mine' 
          ? await sightingsAPI.getMine()
          : await sightingsAPI.getAll();
        setSightings(data);
      } catch (error) {
        console.error('Failed to fetch sightings:', error);
      } finally {
        setIsLoadingSightings(false);
      }
    };
    fetchSightings();
  }, [viewMode]);

  // Filter sightings by sport
  const filteredSightings = useMemo(() => {
    if (!sportFilter) return sightings;
    return sightings.filter(s => 
      s.sport.toLowerCase().includes(sportFilter.toLowerCase())
    );
  }, [sightings, sportFilter]);

  // Get unique sports from current sightings for suggestions
  const sportsInView = useMemo(() => {
    const sports = [...new Set(sightings.map(s => s.sport))];
    return sports.sort();
  }, [sightings]);

  // Handle search button click
  const handleSearch = () => {
    if (!selectedSport) {
      setSearchResults([]);
      setHasSearched(false);
      setSportFilter('');
      return;
    }
    
    const results = sightings.filter(s => 
      s.sport.toLowerCase() === selectedSport.toLowerCase()
    );
    setSearchResults(results);
    setSportFilter(selectedSport);
    setHasSearched(true);
  };

  // Handle clicking on a search result
  const handleResultClick = (sighting: Sighting) => {
    setFlyToLocation([sighting.lat, sighting.lng]);
  };

  // Start journey - show route on map
  const startJourney = (destLat: number, destLng: number) => {
    if (!userLocation) {
      alert('Your location is not available. Please enable location services.');
      return;
    }
    setRouteDestination([destLat, destLng]);
  };

  // Handle route found - format and display distance/time
  const handleRouteFound = (summary: { totalDistance: number; totalTime: number }) => {
    const distanceKm = (summary.totalDistance / 1000).toFixed(1);
    const timeMinutes = Math.round(summary.totalTime / 60);
    const hours = Math.floor(timeMinutes / 60);
    const minutes = timeMinutes % 60;
    
    setRouteInfo({
      distance: `${distanceKm} km`,
      time: hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`
    });
  };

  // Clear route
  const clearRoute = () => {
    setRouteDestination(null);
    setRouteInfo(null);
  };

  // Open in Google Maps for actual navigation
  const openInGoogleMaps = () => {
    if (!userLocation || !routeDestination) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${routeDestination[0]},${routeDestination[1]}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // Clear fly-to after animation completes
  const handleFlyComplete = () => {
    setFlyToLocation(null);
  };

  // Clear search
  const clearSearch = () => {
    setSelectedSport('');
    setSearchResults([]);
    setHasSearched(false);
    setSportFilter('');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setUploadError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      setUploadError('Please select an image');
      return;
    }

    if (!userLocation) {
      setUploadError('Location not available. Please enable location services.');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const result = await sightingsAPI.predict(selectedImage, userLocation[0], userLocation[1]);
      
      // Add new sighting to the list
      setSightings((prev) => [result, ...prev]);
      
      setUploadSuccess(`Detected: ${result.sport} (${Math.round(result.confidence)}% confidence)`);
      setSelectedImage(null);
      setImagePreview(null);
      
      // Center map on new sighting
      setMapCenter([result.lat, result.lng]);
      
      // Clear success message after 5 seconds
      setTimeout(() => setUploadSuccess(''), 5000);
    } catch (error: any) {
      setUploadError(error.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Generate Google Maps navigation URL
  const getNavigationUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Map */}
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenterController 
          center={userLocation} 
          flyTo={flyToLocation}
          onFlyComplete={handleFlyComplete}
        />

        {/* Routing Machine for turn-by-turn directions */}
        <RoutingMachine
          source={userLocation}
          destination={routeDestination}
          onRouteFound={handleRouteFound}
          onRouteClear={() => setRouteInfo(null)}
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">📍 You are here</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Sport sighting markers */}
        {filteredSightings.map((sighting) => (
          <Marker
            key={sighting.id}
            position={[sighting.lat, sighting.lng]}
            icon={createSportIcon(sighting.sport)}
          >
            <Popup>
              <div className="w-64">
                <img
                  src={sighting.image_url}
                  alt={sighting.sport}
                  className="w-full h-40 object-cover rounded-lg mb-2"
                />
                <h3 className="font-bold text-lg text-purple-700">{sighting.sport}</h3>
                <p className="text-sm text-gray-600">
                  Confidence: {Math.round(sighting.confidence)}%
                </p>
                <p className="text-sm text-gray-600">
                  Posted by: <span className="font-medium">{sighting.user}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(sighting.created_at).toLocaleDateString()}
                </p>
                {/* Navigate Button */}
                <a
                  href={getNavigationUrl(sighting.lat, sighting.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block w-full text-center py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition text-sm"
                >
                  🧭 Navigate
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-r from-purple-900/90 to-blue-900/90 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            🏃 Live Active
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              Welcome, <span className="font-medium text-white">{user?.username}</span>
            </span>
            <button
              onClick={logout}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Control Panel */}
      <div 
        className={`absolute top-16 left-0 z-[1000] transition-all duration-300 ${
          sidebarCollapsed ? 'w-12' : 'w-80'
        }`}
      >
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-2 right-0 translate-x-full bg-white/95 backdrop-blur-lg rounded-r-lg p-2 shadow-lg border border-l-0 border-gray-200 hover:bg-gray-50 transition"
        >
          {sidebarCollapsed ? '▶' : '◀'}
        </button>

        {!sidebarCollapsed && (
          <div className="bg-white/95 backdrop-blur-lg rounded-r-2xl shadow-xl p-4 border border-l-0 border-gray-200 m-2 ml-0">
            {/* View Mode Toggle */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                View Mode
              </label>
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                <button
                  onClick={() => setViewMode('community')}
                  className={`flex-1 py-2 px-3 text-sm font-medium transition ${
                    viewMode === 'community'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🌍 Community
                </button>
                <button
                  onClick={() => setViewMode('mine')}
                  className={`flex-1 py-2 px-3 text-sm font-medium transition ${
                    viewMode === 'mine'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  👤 My Uploads
                </button>
              </div>
            </div>

            {/* Sport Search/Filter */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔍 Search Nearby Sports
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                  <option value="">Select a sport...</option>
                  {sportsInView.map((sport) => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition"
                >
                  Search
                </button>
              </div>
              {hasSearched && (
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={clearSearch}
                    className="text-xs text-purple-600 hover:text-purple-800 underline"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>

            {/* Search Results List */}
            {hasSearched && searchResults.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📍 Search Results
                </label>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-purple-700 text-sm">
                          🏆 {result.sport}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          📍 {result.lat.toFixed(4)}, {result.lng.toFixed(4)}
                        </p>
                        <p className="text-xs text-gray-600">
                          👤 Posted by: {result.user}
                        </p>
                        <p className="text-xs text-gray-600">
                          📊 Confidence: {Math.round(result.confidence)}%
                        </p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleResultClick(result)}
                          className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition flex items-center justify-center gap-1"
                        >
                          🗺️ View on Map
                        </button>
                        <button
                          onClick={() => startJourney(result.lat, result.lng)}
                          className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition flex items-center justify-center gap-1"
                        >
                          🚗 Start Journey
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasSearched && searchResults.length === 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  No results found for "{selectedSport}"
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total pins:</span>
                <span className="font-semibold text-purple-700">
                  {isLoadingSightings ? '...' : filteredSightings.length}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Unique sports:</span>
                <span className="font-semibold text-purple-700">{sportsInView.length}</span>
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setShowUploadPanel(!showUploadPanel)}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              📷 {showUploadPanel ? 'Hide Upload' : 'Upload New Sport'}
            </button>

            {/* Upload Panel (Inline) */}
            {showUploadPanel && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  📸 New Sport Sighting
                </h3>

                {/* Error/Success Messages */}
                {uploadError && (
                  <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded-lg text-red-700 text-xs">
                    {uploadError}
                  </div>
                )}
                {uploadSuccess && (
                  <div className="mb-3 p-2 bg-green-100 border border-green-300 rounded-lg text-green-700 text-xs">
                    {uploadSuccess}
                  </div>
                )}

                {/* Image Preview or Upload Button */}
                {imagePreview ? (
                  <div className="relative mb-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={clearSelection}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-3 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition"
                  >
                    <div className="text-2xl mb-1">📷</div>
                    <p className="text-gray-600 text-xs">Click to select image</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {/* Location Status */}
                <div className="mb-3 text-xs">
                  {userLocation ? (
                    <p className="text-green-600 flex items-center gap-1">
                      ✓ Location: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                    </p>
                  ) : (
                    <p className="text-orange-600 flex items-center gap-1">
                      ⚠ Waiting for location...
                    </p>
                  )}
                </div>

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={!selectedImage || !userLocation || isUploading}
                  className="w-full py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>🚀 Classify & Post</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Route Info Panel */}
      {routeDestination && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-4 border border-gray-200 min-w-72">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              🗺️ Route Active
            </h3>
            <button
              onClick={clearRoute}
              className="text-gray-400 hover:text-gray-600 text-lg"
            >
              ✕
            </button>
          </div>
          
          {routeInfo ? (
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📏</span>
                <div>
                  <p className="text-xs text-gray-500">Distance</p>
                  <p className="font-bold text-purple-700">{routeInfo.distance}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏱️</span>
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-bold text-purple-700">{routeInfo.time}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-3">Calculating route...</p>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={openInGoogleMaps}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-1"
            >
              🚗 Open in Google Maps
            </button>
            <button
              onClick={clearRoute}
              className="py-2 px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Quick Upload FAB (mobile) */}
      <button
        onClick={() => {
          setSidebarCollapsed(false);
          setShowUploadPanel(true);
        }}
        className="absolute bottom-6 right-6 z-[1000] w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full shadow-lg flex items-center justify-center text-white text-2xl transition-transform hover:scale-110"
      >
        📷
      </button>
    </div>
  );
};

export default MapApp;
