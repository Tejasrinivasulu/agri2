import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  ThermometerSun,
  Volume2,
  VolumeX,
  Loader2,
  Navigation,
  MapPin,
  RefreshCw,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { supabase } from "@/integrations/supabase/client";
import { STATE_OPTIONS, STATES_DISTRICTS } from "@/data/cropRates";

interface WeatherScreenProps {
  onBack: () => void;
}

interface CurrentWeather {
  temperature: number;
  condition: string;
  humidity: number;
  wind_speed: number;
  rainfall: number;
  icon: string;
  date: string;
}

interface ForecastDay {
  date: string;
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  rainfall: number;
}

interface WeatherResponse {
  success: boolean;
  location: string;
  current: CurrentWeather;
  previous?: ForecastDay[];
  forecast: ForecastDay[];
  farmingAdvice: string;
  source: string;
}

interface PreviousWeather extends WeatherResponse {
  savedAt: string;
  previous?: ForecastDay[];
}

interface LearningVideo {
  id: string;
  title: string;
  youtube_url: string;
  language: string;
}

const STORAGE_KEY = "weather_previous_predictions";

const WeatherScreen: React.FC<WeatherScreenProps> = ({ onBack }) => {
  const [location, setLocation] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [previousDays, setPreviousDays] = useState<ForecastDay[]>([]);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [previousWeather, setPreviousWeather] = useState<PreviousWeather | null>(null);
  const [farmingAdvice, setFarmingAdvice] = useState("");
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationMethod, setLocationMethod] = useState<"auto" | "manual">("manual");
  const { speak, isSpeaking, stopSpeaking } = useAIAssistant();

  const districtOptions = selectedState ? (STATES_DISTRICTS[selectedState] ?? []) : [];

  useEffect(() => {
    setSelectedDistrict("");
  }, [selectedState]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("learning_videos")
          .select("*")
          .eq("feature_name", "Weather");
        if (!cancelled && data) setVideos(data);
      } catch {
        // ignore if Supabase not configured
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load previous weather from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.location) {
          setPreviousWeather(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Don't auto-detect on mount - only when user clicks "Use My Location"

  const handleAutoDetect = () => {
    if (navigator.geolocation) {
      setLoading(true);
      setError(null);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Reverse geocode to get location name
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const locationName = data.display_name || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
            setLocation(locationName);
            await fetchWeather(locationName, latitude, longitude);
          } catch {
            setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
            await fetchWeather(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`, latitude, longitude);
          }
        },
        () => {
          setError("Location access denied. Please select location manually.");
          setLocationMethod("manual");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation not supported. Please select location manually.");
      setLocationMethod("manual");
    }
  };

  const handleManualLocation = () => {
    if (selectedState && selectedDistrict) {
      const loc = `${selectedDistrict}, ${selectedState}`;
      setLocation(loc);
      fetchWeather(loc);
    } else {
      setError("Please select State and District");
    }
  };

  const handleUseDefaultLocation = () => {
    const defaultLoc = "Chennai, Tamil Nadu";
    setLocation(defaultLoc);
    setLocationMethod("manual");
    fetchWeather(defaultLoc);
  };

  const fetchWeather = async (loc: string, lat?: number, lon?: number) => {
    setLoading(true);
    setError(null);
    try {
        // Save current weather as previous BEFORE fetching new data (only if location is changing)
        if (currentWeather && location && location !== loc) {
          const previous: PreviousWeather = {
            success: true,
            location: location,
            current: currentWeather,
            previous: previousDays,
            forecast: forecast,
            farmingAdvice: farmingAdvice,
            source: "Previous",
            savedAt: new Date().toISOString(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(previous));
          setPreviousWeather(previous);
        }

      const body: any = { location: loc };
      if (lat !== undefined && lon !== undefined) {
        body.latitude = lat;
        body.longitude = lon;
      }

      const { data, error: fnError } = await supabase.functions.invoke("weather", { body });

      if (fnError) {
        // If function not deployed, use fallback
        console.warn("Weather function error, using fallback:", fnError);
        const fallbackData = getFallbackWeather(loc);
        setCurrentWeather(fallbackData.current);
        setPreviousDays(fallbackData.previous || []);
        setForecast(fallbackData.forecast);
        setFarmingAdvice(fallbackData.farmingAdvice);
        setLocation(loc);
        
        const toSave: PreviousWeather = {
          ...fallbackData,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        setLoading(false);
        return;
      }

      if (data?.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      if (data?.success) {
        setCurrentWeather(data.current);
        setPreviousDays(data.previous || []);
        setForecast(data.forecast || []);
        setFarmingAdvice(data.farmingAdvice || "");
        const finalLocation = data.location || loc;
        setLocation(finalLocation);

        // Save this prediction for next time (when location changes)
        const toSave: PreviousWeather = {
          success: true,
          location: finalLocation,
          current: data.current,
          previous: data.previous || [],
          forecast: data.forecast || [],
          farmingAdvice: data.farmingAdvice || "",
          source: data.source || "Weather API",
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } else {
        // Fallback if no success flag
        const fallbackData = getFallbackWeather(loc);
        setCurrentWeather(fallbackData.current);
        setPreviousDays(fallbackData.previous || []);
        setForecast(fallbackData.forecast);
        setFarmingAdvice(fallbackData.farmingAdvice);
        setLocation(loc);
        
        const toSave: PreviousWeather = {
          ...fallbackData,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      }
    } catch (e) {
      console.error("Weather fetch error:", e);
      // Use fallback on any error
      const fallbackData = getFallbackWeather(loc);
      setCurrentWeather(fallbackData.current);
      setPreviousDays(fallbackData.previous || []);
      setForecast(fallbackData.forecast);
      setFarmingAdvice(fallbackData.farmingAdvice);
      setLocation(loc);
      
      const toSave: PreviousWeather = {
        ...fallbackData,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } finally {
      setLoading(false);
    }
  };

  // Fallback weather data when API fails
  const getFallbackWeather = (loc: string): WeatherResponse => {
    const today = new Date().toISOString().slice(0, 10);
    const base = loc.length * 7;
    
    // Previous 4 days
    const previous = [];
    for (let i = 4; i >= 1; i--) {
      const date = addDays(today, -i);
      const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "short" });
      previous.push({
        date,
        day: dayName,
        high: 28 + (base % 6) + i,
        low: 22 + (base % 4) + i,
        condition: i === 1 ? "Partly Cloudy" : i === 2 ? "Sunny" : i === 3 ? "Cloudy" : "Sunny",
        icon: i === 1 ? "🌤️" : i === 2 ? "☀️" : i === 3 ? "⛅" : "☀️",
        rainfall: i === 1 ? 2 : 0,
      });
    }
    
    return {
      success: true,
      location: loc,
      current: {
        temperature: 28 + (base % 8),
        condition: "Partly Cloudy",
        humidity: 60 + (base % 20),
        wind_speed: 10 + (base % 10),
        rainfall: base % 5,
        icon: "🌤️",
        date: today,
      },
      previous,
      forecast: [
        { date: addDays(today, 1), day: "Tomorrow", high: 31, low: 23, condition: "Cloudy", icon: "⛅", rainfall: 2 },
        { date: addDays(today, 2), day: "Day 2", high: 30, low: 22, condition: "Rain", icon: "🌧️", rainfall: 8 },
        { date: addDays(today, 3), day: "Day 3", high: 29, low: 21, condition: "Rain", icon: "🌧️", rainfall: 12 },
        { date: addDays(today, 4), day: "Day 4", high: 31, low: 23, condition: "Sunny", icon: "☀️", rainfall: 0 },
        { date: addDays(today, 5), day: "Day 5", high: 32, low: 24, condition: "Sunny", icon: "☀️", rainfall: 0 },
        { date: addDays(today, 6), day: "Day 6", high: 33, low: 25, condition: "Partly Cloudy", icon: "🌤️", rainfall: 1 },
        { date: addDays(today, 7), day: "Day 7", high: 32, low: 24, condition: "Sunny", icon: "☀️", rainfall: 0 },
      ],
      farmingAdvice: "Good conditions for field work. Consider irrigation in the morning hours.",
      source: "Fallback",
    };
  };

  const addDays = (dateStr: string, days: number): string => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  };

  const handleRefresh = () => {
    if (location) {
      fetchWeather(location);
    } else if (selectedState && selectedDistrict) {
      handleManualLocation();
    } else {
      handleAutoDetect();
    }
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    if (!currentWeather) return;
    const text = `Current weather: ${currentWeather.temperature} degrees, ${currentWeather.condition}, humidity ${currentWeather.humidity} percent, wind speed ${currentWeather.wind_speed} kilometers per hour. ${farmingAdvice}`;
    speak(text);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-sky p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Weather 🌦️</h1>
            <p className="text-sm text-muted-foreground">
              {location || "Select location"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={loading}
              className="text-foreground"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReadAloud}
              className="text-foreground"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Location Selection */}
        {!location && (
          <div className="space-y-3 mb-4">
            <div className="flex gap-2">
              <Button
                variant={locationMethod === "auto" ? "default" : "outline"}
                className="flex-1 gap-2 min-h-[44px] text-sm"
                onClick={() => {
                  setLocationMethod("auto");
                  handleAutoDetect();
                }}
              >
                <Navigation className="w-4 h-4" />
                Use My Location
              </Button>
              <Button
                variant={locationMethod === "manual" ? "default" : "outline"}
                className="flex-1 gap-2 min-h-[44px] text-sm"
                onClick={() => setLocationMethod("manual")}
              >
                <MapPin className="w-4 h-4" />
                Select Location
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleUseDefaultLocation}
            >
              <MapPin className="w-4 h-4" />
              Use Default Location (Chennai, Tamil Nadu)
            </Button>

            {locationMethod === "manual" && (
              <>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedDistrict}
                  onValueChange={setSelectedDistrict}
                  disabled={!selectedState}
                >
                  <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent>
                    {districtOptions.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  className="w-full min-h-[44px] text-base font-medium"
                  onClick={handleManualLocation}
                  disabled={!selectedState || !selectedDistrict || loading}
                >
                  Get Weather
                </Button>
              </>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-2 mb-4">
            {error}
          </p>
        )}

        {/* Current Weather Display */}
        {currentWeather && (
          <>
            <div className="text-center mb-6">
              <span className="text-6xl">{currentWeather.icon}</span>
              <p className="text-6xl font-bold text-foreground mt-2">
                {currentWeather.temperature}°C
              </p>
              <p className="text-lg text-muted-foreground">{currentWeather.condition}</p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-3 text-center">
                <ThermometerSun className="w-5 h-5 text-sunrise mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Feels like</p>
                <p className="font-bold text-foreground">{currentWeather.temperature + 2}°C</p>
              </div>
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-3 text-center">
                <Droplets className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Humidity</p>
                <p className="font-bold text-foreground">{currentWeather.humidity}%</p>
              </div>
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-3 text-center">
                <Wind className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Wind</p>
                <p className="font-bold text-foreground">{currentWeather.wind_speed} km/h</p>
              </div>
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-3 text-center">
                <CloudRain className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Rain</p>
                <p className="font-bold text-foreground">{currentWeather.rainfall}mm</p>
              </div>
            </div>
          </>
        )}

        {loading && !currentWeather && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Fetching weather...</span>
          </div>
        )}
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Previous 4 Days Weather (when location changes) */}
        {previousWeather && previousWeather.location !== location && previousWeather.previous && previousWeather.previous.length > 0 && (
          <div>
            <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              📅 Previous 4 Days Prediction
              <span className="text-xs text-muted-foreground font-normal">
                ({previousWeather.location})
              </span>
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {previousWeather.previous.map((day) => (
                <div
                  key={day.date}
                  className="flex-shrink-0 w-20 rounded-2xl p-3 text-center bg-card/50 border border-border/50"
                >
                  <p className="text-xs text-muted-foreground">{day.day}</p>
                  <span className="text-xl my-1 block">{day.icon}</span>
                  <p className="font-bold text-sm">{day.high}°</p>
                  <p className="text-xs text-muted-foreground">{day.low}°</p>
                  {day.rainfall > 0 && (
                    <p className="text-xs mt-1">💧 {day.rainfall}mm</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previous 4 Days from Current Location (if available) */}
        {previousDays.length > 0 && (!previousWeather || previousWeather.location === location) && (
          <div>
            <h2 className="font-semibold text-foreground mb-2">📅 Previous 4 Days</h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {previousDays.map((day) => (
                <div
                  key={day.date}
                  className="flex-shrink-0 w-20 rounded-2xl p-3 text-center bg-card/50 border border-border/50"
                >
                  <p className="text-xs text-muted-foreground">{day.day}</p>
                  <span className="text-xl my-1 block">{day.icon}</span>
                  <p className="font-bold text-sm">{day.high}°</p>
                  <p className="text-xs text-muted-foreground">{day.low}°</p>
                  {day.rainfall > 0 && (
                    <p className="text-xs mt-1">💧 {day.rainfall}mm</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Present Day Weather */}
        {currentWeather && (
          <div>
            <h2 className="font-semibold text-foreground mb-2">🌤️ Present Day (Today)</h2>
            <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">{location}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {currentWeather.temperature}°C
                  </p>
                  <p className="text-sm text-muted-foreground">{currentWeather.condition}</p>
                </div>
                <span className="text-4xl">{currentWeather.icon}</span>
              </div>
            </div>
          </div>
        )}

        {/* Future 7 Days Forecast */}
        {forecast.length > 0 && (
          <div>
            <h2 className="font-semibold text-foreground mb-2">📆 Future Forecast (Next 7 Days)</h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {forecast.map((day, idx) => (
                <div
                  key={day.date}
                  className={`flex-shrink-0 w-24 rounded-2xl p-3 text-center ${
                    idx === 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-card shadow-card"
                  }`}
                >
                  <p
                    className={`text-xs font-medium ${
                      idx === 0 ? "opacity-80" : "text-muted-foreground"
                    }`}
                  >
                    {day.day}
                  </p>
                  <span className="text-2xl my-1 block">{day.icon}</span>
                  <p className="font-bold text-sm">{day.high}°</p>
                  <p className={`text-xs ${idx === 0 ? "opacity-70" : "text-muted-foreground"}`}>
                    {day.low}°
                  </p>
                  {day.rainfall > 0 && (
                    <p className="text-xs mt-1">💧 {day.rainfall}mm</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Farming Advice */}
        {farmingAdvice && (
          <div className="bg-leaf-light/30 rounded-2xl p-4 border border-leaf-medium/20">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              🌾 Farming Advice
            </h3>
            <p className="text-sm text-foreground">{farmingAdvice}</p>
          </div>
        )}

        {/* Learning Videos */}
        {videos.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-3">🎥 Learning Videos</h3>
            <div className="space-y-2">
              {videos.map((video) => (
                <a
                  key={video.id}
                  href={video.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-card rounded-xl p-3 shadow-card hover:bg-secondary/30 transition-colors"
                >
                  <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <Play className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{video.language}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherScreen;
