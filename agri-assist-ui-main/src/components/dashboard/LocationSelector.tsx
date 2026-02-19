import React, { useState } from 'react';
import { MapPin, ChevronDown, Navigation, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MapView from '@/components/ui/MapView';

interface LocationSelectorProps {
  location: string;
  onLocationChange: (location: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ location, onLocationChange }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);

  const popularLocations = [
    'Hyderabad, Telangana',
    'Vijayawada, Andhra Pradesh',
    'Chennai, Tamil Nadu',
    'Bangalore, Karnataka',
    'Warangal, Telangana',
    'Visakhapatnam, Andhra Pradesh',
    'Tirupati, Andhra Pradesh',
    'Vijayanagaram, Andhra Pradesh',
  ];

  const handleAutoDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Reverse geocoding to get address
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(res => res.json())
            .then(data => {
              const address = data.display_name || `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
              onLocationChange(address);
              setIsOpen(false);
            })
            .catch(() => {
              onLocationChange(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
              setIsOpen(false);
            });
        },
        () => {
          onLocationChange('Hyderabad, Telangana');
          setIsOpen(false);
        }
      );
    }
  };

  const handleSelectLocation = (loc: string) => {
    onLocationChange(loc);
    setIsOpen(false);
  };

  const handleMapLocationSelect = (lat: number, lng: number, address?: string) => {
    setSelectedCoords([lat, lng]);
    if (address) {
      onLocationChange(address);
    } else {
      onLocationChange(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
    }
    setIsMapOpen(false);
    setIsOpen(false);
  };

  const handleSearchLocation = async () => {
    if (!searchValue.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchValue)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        onLocationChange(display_name);
        setSelectedCoords([parseFloat(lat), parseFloat(lon)]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-1 px-2 py-1 h-auto text-primary-foreground hover:bg-card/20">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium max-w-[120px] truncate">{location}</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="start">
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Locations</TabsTrigger>
              <TabsTrigger value="map">Map View</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-3 mt-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-primary"
                onClick={handleAutoDetect}
              >
                <Navigation className="w-4 h-4" />
                Auto-detect Location
              </Button>

              <div className="flex gap-2">
                <Input
                  placeholder="Search location..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchLocation()}
                />
                <Button onClick={handleSearchLocation} size="sm">
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium px-1">Popular Locations</p>
                {popularLocations
                  .filter(loc => loc.toLowerCase().includes(searchValue.toLowerCase()))
                  .map((loc) => (
                    <button
                      key={loc}
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors"
                    >
                      {loc}
                    </button>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="map" className="mt-3">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Click on the map to select your location or use the full map view.
                </p>
                <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2">
                      <Map className="w-4 h-4" />
                      Open Full Map
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Select Location on Map</DialogTitle>
                    </DialogHeader>
                    <MapView
                      height="500px"
                      onLocationSelect={handleMapLocationSelect}
                      selectedLocation={selectedCoords || undefined}
                      showAgriculturalFeatures={true}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default LocationSelector;
