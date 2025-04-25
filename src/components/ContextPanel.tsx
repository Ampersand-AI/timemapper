
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WeatherService, { WeatherData } from '@/services/WeatherService';
import NewsService, { NewsItem } from '@/services/NewsService';

interface ContextPanelProps {
  fromZone: string;
  toZone: string;
  scheduledTime: Date;
}

const WeatherCard: React.FC<{ weather: WeatherData | null }> = ({ weather }) => {
  if (!weather) return (
    <div className="neo-inset p-4 animate-pulse h-[140px] flex items-center justify-center text-gray-500">
      Loading weather data...
    </div>
  );

  return (
    <div className="neo-inset p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-sm">{weather.location}</h4>
          <p className="text-xs text-gray-400">{new Date(weather.timestamp).toLocaleString()}</p>
        </div>
        <div className="text-3xl">{weather.icon}</div>
      </div>
      
      <div className="mt-3 flex items-end">
        <span className="text-2xl font-bold">{weather.temperature}°{weather.temperatureUnit}</span>
        <span className="text-sm text-gray-400 ml-2">{weather.condition}</span>
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-gray-400">
        <div>
          <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1"></span>
          {weather.humidity}% humidity
        </div>
        <div>
          <span className="inline-block w-2 h-2 rounded-full bg-sky-400 mr-1"></span>
          {weather.chanceOfRain}% rain
        </div>
      </div>
    </div>
  );
};

const BusinessNewsSection: React.FC<{ news: NewsItem[] }> = ({ news }) => {
  if (!news.length) return (
    <div className="neo-inset p-4 animate-pulse h-[140px] flex items-center justify-center text-gray-500">
      Loading business news...
    </div>
  );

  return (
    <div className="neo-inset p-4">
      <h4 className="font-medium mb-3">Business Headlines</h4>
      
      <ul className="space-y-3">
        {news.map((item, index) => (
          <li key={index} className="text-sm">
            <div>
              <div className="font-medium">{item.title}</div>
              <div className="text-xs text-gray-400 mt-1">{item.summary}</div>
              <div className="text-xs text-gray-500 mt-1">{item.source}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ContextPanel: React.FC<ContextPanelProps> = ({ fromZone, toZone, scheduledTime }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [myWeather, setMyWeather] = useState<WeatherData | null>(null);
  const [theirWeather, setTheirWeather] = useState<WeatherData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContextData = async () => {
      setLoading(true);
      
      // Extract location names from zone IDs
      const fromLocation = fromZone.split('/').pop()?.replace(/_/g, ' ') || fromZone;
      const toLocation = toZone.split('/').pop()?.replace(/_/g, ' ') || toZone;
      
      // Fetch data in parallel
      const [myWeatherData, theirWeatherData, newsItems] = await Promise.all([
        WeatherService.getWeatherForLocation(fromLocation, scheduledTime.getTime()),
        WeatherService.getWeatherForLocation(toLocation, scheduledTime.getTime()),
        NewsService.getNewsForLocation(toLocation)
      ]);
      
      setMyWeather(myWeatherData);
      setTheirWeather(theirWeatherData);
      setNews(newsItems);
      setLoading(false);
    };
    
    fetchContextData();
  }, [fromZone, toZone, scheduledTime]);

  return (
    <div className="neo-raised mt-6 overflow-hidden">
      <div className="p-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center">
          <Info size={16} className="text-neo-my-accent mr-2" />
          <h3 className="text-sm font-medium">Context</h3>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 h-auto"
        >
          {isExpanded ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-4 animate-slide-down">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Weather Conditions</h4>
              <WeatherCard weather={myWeather} />
              <WeatherCard weather={theirWeather} />
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-4">Business News</h4>
              <BusinessNewsSection news={news} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextPanel;
