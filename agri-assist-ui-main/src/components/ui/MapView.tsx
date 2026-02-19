import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polygon, Circle } from 'react-leaflet';
import { Icon, LatLngExpression, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Search,
  Layers,
  Satellite,
  Navigation,
  CloudRain,
  Droplets,
  Tractor,
  Store,
  Building2
} from 'lucide-react';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  showControls?: boolean;
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
  selectedLocation?: [number, number];
  showAgriculturalFeatures?: boolean;
}

interface AgriculturalFeature {
  id: string;
  type: 'farm' | 'canal' | 'market' | 'warehouse' | 'processing';
  name: string;
  position: [number, number];
  area?: number; // in hectares
  description?: string;
}

// Sample agricultural features for demonstration
const sampleFeatures: AgriculturalFeature[] = [
  {
    id: '1',
    type: 'farm',
    name: 'Green Valley Farm',
    position: [17.3850, 78.4867],
    area: 25,
    description: 'Rice and wheat cultivation'
  },
  {
    id: '2',
    type: 'market',
    name: 'Agricultural Market',
    position: [17.3850, 78.4967],
    description: 'Fresh produce and grains'
  },
  {
    id: '3',
    type: 'canal',
    name: 'Irrigation Canal',
    position: [17.3750, 78.4867],
    description: 'Major irrigation source'
  },
  {
    id: '4',
    type: 'warehouse',
    name: 'Cold Storage',
    position: [17.3950, 78.4867],
    description: 'Temperature controlled storage'
  }
];

const LocationMarker: React.FC<{
  position: [number, number];
  onLocationSelect?: (lat: number, lng: number) => void;
}> = ({ position, onLocationSelect }) => {
  const map = useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>
        Selected Location<br />
        Lat: {position[0].toFixed(4)}, Lng: {position[1].toFixed(4)}
      </Popup>
    </Marker>
  ) : null;
};

const AgriculturalMarkers: React.FC<{
  features: AgriculturalFeature[];
  onFeatureClick?: (feature: AgriculturalFeature) => void;
}> = ({ features, onFeatureClick }) => {
  const getIcon = (type: string) => {
    const iconMap = {
      farm: Tractor,
      market: Store,
      canal: Droplets,
      warehouse: Building2,
      processing: Building2
    };

    const IconComponent = iconMap[type as keyof typeof iconMap] || MapPin;
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#22c55e" stroke="white" stroke-width="2"/>
          <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${type[0].toUpperCase()}</text>
        </svg>
      `)}`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
    });
  };

  return (
    <>
      {features.map((feature) => (
        <Marker
          key={feature.id}
          position={feature.position}
          icon={getIcon(feature.type)}
          eventHandlers={{
            click: () => onFeatureClick?.(feature),
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-sm">{feature.name}</h3>
              <Badge variant="secondary" className="text-xs mt-1">
                {feature.type}
              </Badge>
              {feature.area && (
                <p className="text-xs text-muted-foreground mt-1">
                  Area: {feature.area} ha
                </p>
              )}
              {feature.description && (
                <p className="text-xs mt-1">{feature.description}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

const MapView: React.FC<MapViewProps> = ({
  center = [17.3850, 78.4867], // Hyderabad coordinates
  zoom = 13,
  height = '400px',
  showControls = true,
  onLocationSelect,
  selectedLocation,
  showAgriculturalFeatures = true,
}) => {
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('satellite');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeature, setSelectedFeature] = useState<AgriculturalFeature | null>(null);
  const [weatherOverlay, setWeatherOverlay] = useState(false);

  const tileLayers = {
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      // Using Nominatim API for geocoding (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        if (onLocationSelect) {
          onLocationSelect(parseFloat(lat), parseFloat(lon), data[0].display_name);
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (onLocationSelect) {
            onLocationSelect(latitude, longitude, 'Current Location');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Agricultural Map
          </CardTitle>
          {showControls && (
            <div className="flex items-center gap-2">
              <Button
                variant={mapType === 'satellite' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMapType('satellite')}
                className="flex items-center gap-1"
              >
                <Satellite className="w-4 h-4" />
                Satellite
              </Button>
              <Button
                variant={mapType === 'streets' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMapType('streets')}
                className="flex items-center gap-1"
              >
                <Layers className="w-4 h-4" />
                Streets
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeatherOverlay(!weatherOverlay)}
                className="flex items-center gap-1"
              >
                <CloudRain className="w-4 h-4" />
                Weather
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {showControls && (
          <div className="p-4 pb-2 flex gap-2">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} size="sm">
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={getCurrentLocation} variant="outline" size="sm">
              <Navigation className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div style={{ height, width: '100%' }}>
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            className="rounded-b-lg"
          >
            <TileLayer
              url={tileLayers[mapType]}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Agricultural Features */}
            {showAgriculturalFeatures && (
              <AgriculturalMarkers
                features={sampleFeatures}
                onFeatureClick={setSelectedFeature}
              />
            )}

            {/* Selected Location Marker */}
            {selectedLocation && (
              <Marker position={selectedLocation}>
                <Popup>
                  <div className="text-center">
                    <strong>Selected Location</strong><br />
                    Lat: {selectedLocation[0].toFixed(4)}<br />
                    Lng: {selectedLocation[1].toFixed(4)}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Click to select location */}
            <LocationMarker
              position={selectedLocation || center}
              onLocationSelect={onLocationSelect}
            />

            {/* Weather overlay (simplified) */}
            {weatherOverlay && selectedLocation && (
              <Circle
                center={selectedLocation}
                radius={5000}
                pathOptions={{
                  color: 'blue',
                  fillColor: 'blue',
                  fillOpacity: 0.1,
                }}
              >
                <Popup>
                  <div className="text-center">
                    <CloudRain className="w-4 h-4 inline mr-1" />
                    Weather Zone<br />
                    <small>Rainfall: 25mm expected</small>
                  </div>
                </Popup>
              </Circle>
            )}
          </MapContainer>
        </div>

        {/* Feature Details Panel */}
        {selectedFeature && (
          <div className="p-4 border-t bg-muted/50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-sm">{selectedFeature.name}</h3>
                <Badge variant="secondary" className="text-xs mt-1">
                  {selectedFeature.type}
                </Badge>
                {selectedFeature.area && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Area: {selectedFeature.area} hectares
                  </p>
                )}
                {selectedFeature.description && (
                  <p className="text-xs mt-1">{selectedFeature.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFeature(null)}
              >
                ✕
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapView;