import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MapView from '@/components/ui/MapView';
import {
  MapPin,
  Search,
  Filter,
  Plus,
  Tractor,
  Droplets,
  Store,
  Building2,
  CloudRain,
  Navigation
} from 'lucide-react';

const MapScreen: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>(['farms', 'markets', 'canals']);
  const [showWeather, setShowWeather] = useState(false);

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setSelectedLocation([lat, lng]);
    console.log('Selected location:', { lat, lng, address });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setSelectedLocation([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const filters = [
    { id: 'farms', label: 'Farms', icon: Tractor, color: 'bg-green-500' },
    { id: 'markets', label: 'Markets', icon: Store, color: 'bg-blue-500' },
    { id: 'canals', label: 'Irrigation', icon: Droplets, color: 'bg-cyan-500' },
    { id: 'warehouses', label: 'Storage', icon: Building2, color: 'bg-orange-500' },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Agricultural Map</h1>
          <p className="text-muted-foreground mt-1">
            Explore farms, markets, and agricultural infrastructure in your area
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for farms, markets, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowWeather(!showWeather)}
              className={showWeather ? 'bg-blue-50 border-blue-200' : ''}
            >
              <CloudRain className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilters.includes(filter.id);
              return (
                <Button
                  key={filter.id}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleFilter(filter.id)}
                  className={`flex items-center gap-2 ${isActive ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  {filter.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Map View */}
      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map">Interactive Map</TabsTrigger>
          <TabsTrigger value="satellite">Satellite View</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-4">
          <MapView
            height="600px"
            onLocationSelect={handleLocationSelect}
            selectedLocation={selectedLocation || undefined}
            showAgriculturalFeatures={true}
            center={selectedLocation || [17.3850, 78.4867]}
            zoom={selectedLocation ? 15 : 10}
          />
        </TabsContent>

        <TabsContent value="satellite" className="mt-4">
          <MapView
            height="600px"
            onLocationSelect={handleLocationSelect}
            selectedLocation={selectedLocation || undefined}
            showAgriculturalFeatures={true}
            center={selectedLocation || [17.3850, 78.4867]}
            zoom={selectedLocation ? 15 : 10}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <Tractor className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold">Find Nearby Farms</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Discover agricultural lands and farming communities
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <Store className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold">Locate Markets</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Find agricultural markets and trading centers
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <Droplets className="w-8 h-8 mx-auto mb-2 text-cyan-600" />
            <h3 className="font-semibold">Irrigation Sources</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Identify canals, wells, and water resources
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Map Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Map Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm">Farms</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Markets</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-cyan-500 rounded-full"></div>
              <span className="text-sm">Irrigation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-sm">Storage</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapScreen;