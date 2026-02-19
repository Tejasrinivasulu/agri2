import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MapView from '@/components/ui/MapView';
import {
  ArrowLeft,
  Search,
  Tractor,
  Droplets,
  Store,
  Building2,
  CloudRain,
  Navigation,
} from 'lucide-react';

interface MapScreenProps {
  onBack: () => void;
}

const MapScreen: React.FC<MapScreenProps> = ({ onBack }) => {
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>(['farms', 'markets', 'canals']);
  const [showWeather, setShowWeather] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setSelectedLocation([lat, lng]);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchError(null);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setSelectedLocation([parseFloat(lat), parseFloat(lon)]);
      } else {
        setSearchError('Location not found. Try a different search.');
      }
    } catch (error) {
      setSearchError('Search failed. Check connection.');
    }
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const filters = [
    { id: 'farms', label: 'Farms', icon: Tractor },
    { id: 'markets', label: 'Markets', icon: Store },
    { id: 'canals', label: 'Irrigation', icon: Droplets },
    { id: 'warehouses', label: 'Storage', icon: Building2 },
  ];

  const defaultCenter: [number, number] = [17.385, 78.4867];
  const mapHeightPx = 400;

  const goToMyLocation = () => {
    if (!navigator.geolocation) {
      setSearchError('Location not supported on this device.');
      return;
    }
    setSearchError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => setSelectedLocation([pos.coords.latitude, pos.coords.longitude]),
      () => setSearchError('Could not get your location.')
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-4 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">🗺️ Map View</h1>
            <p className="text-sm text-primary-foreground/80">Farms, markets, irrigation</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 bg-card/90 border-0 min-h-[44px]"
            />
          </div>
          <Button size="icon" className="min-h-[44px] min-w-[44px] bg-card text-foreground" onClick={handleSearch}>
            <Search className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="min-h-[44px] min-w-[44px] bg-card/90 text-foreground border-0"
            onClick={goToMyLocation}
            title="My location"
          >
            <Navigation className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={`min-h-[44px] min-w-[44px] ${showWeather ? 'bg-primary/20 border-primary text-primary-foreground' : 'bg-card/90 text-foreground border-0'}`}
            onClick={() => setShowWeather(!showWeather)}
          >
            <CloudRain className="w-4 h-4" />
          </Button>
        </div>
        {searchError && <p className="text-xs text-destructive mt-2">{searchError}</p>}
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilters.includes(filter.id);
            return (
              <Button
                key={filter.id}
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => toggleFilter(filter.id)}
                className={`flex-shrink-0 ${isActive ? 'bg-card text-foreground' : 'text-primary-foreground'}`}
              >
                <Icon className="w-3 h-3 mr-1" />
                {filter.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="px-4 mt-4">
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="satellite">Satellite</TabsTrigger>
          </TabsList>
          <TabsContent value="map" className="mt-0">
            <div className="rounded-2xl overflow-hidden border border-border shadow-card" style={{ height: `${mapHeightPx}px` }}>
              <MapView
                height={`${mapHeightPx}px`}
                showControls={false}
                mapType="streets"
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedLocation || undefined}
                showAgriculturalFeatures={true}
                center={selectedLocation || defaultCenter}
                zoom={selectedLocation ? 15 : 10}
              />
            </div>
          </TabsContent>
          <TabsContent value="satellite" className="mt-0">
            <div className="rounded-2xl overflow-hidden border border-border shadow-card" style={{ height: `${mapHeightPx}px` }}>
              <MapView
                height={`${mapHeightPx}px`}
                showControls={false}
                mapType="satellite"
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedLocation || undefined}
                showAgriculturalFeatures={true}
                center={selectedLocation || defaultCenter}
                zoom={selectedLocation ? 15 : 10}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-3 rounded-xl bg-card border border-border">
          <p className="text-xs font-semibold text-foreground mb-2">Legend</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500" /> Farms</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500" /> Markets</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-cyan-500" /> Irrigation</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500" /> Storage</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3">
            <Tractor className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground">Nearby farms</p>
              <p className="text-xs text-muted-foreground">Explore agricultural lands</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
            <Store className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground">Markets</p>
              <p className="text-xs text-muted-foreground">Trading and mandis</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-3">
            <Droplets className="w-8 h-8 text-cyan-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground">Irrigation</p>
              <p className="text-xs text-muted-foreground">Canals and water sources</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapScreen;
