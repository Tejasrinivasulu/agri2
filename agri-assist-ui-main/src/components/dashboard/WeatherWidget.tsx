import React from 'react';
import { Sun, Cloud, Droplets, Wind } from 'lucide-react';

interface WeatherWidgetProps {
  location: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ location }) => {
  return (
    <div className="bg-card/20 backdrop-blur-sm rounded-2xl p-4 text-primary-foreground">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">Today's Weather</p>
          <p className="text-xs opacity-60 mb-1">{location}</p>
          <div className="flex items-center gap-2 mt-1">
            <Sun className="w-10 h-10" />
            <div>
              <span className="text-4xl font-bold">28°C</span>
              <p className="text-sm opacity-80">Sunny</p>
            </div>
          </div>
        </div>
        <div className="text-right space-y-2">
          <div className="flex items-center gap-2 justify-end">
            <Cloud className="w-4 h-4 opacity-80" />
            <span className="text-sm">15%</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Droplets className="w-4 h-4 opacity-80" />
            <span className="text-sm">65%</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Wind className="w-4 h-4 opacity-80" />
            <span className="text-sm">12 km/h</span>
          </div>
        </div>
      </div>
      <p className="text-sm mt-2 opacity-90 bg-card/20 rounded-lg px-3 py-1.5 inline-block">
        🌾 Good weather for farming activities
      </p>
    </div>
  );
};

export default WeatherWidget;
