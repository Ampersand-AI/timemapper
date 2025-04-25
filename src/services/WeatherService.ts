
// Weather service to fetch forecasts for locations

export interface WeatherData {
  location: string;
  temperature: number;
  temperatureUnit: 'C' | 'F';
  condition: string;
  icon: string;
  humidity: number;
  chanceOfRain: number;
  timestamp: number;
}

interface WeatherCache {
  [locationKey: string]: {
    data: WeatherData;
    expiry: number;
  };
}

class WeatherService {
  private cache: WeatherCache = {};
  private cacheExpiryMs = 30 * 60 * 1000; // 30 minutes

  // Get weather for a location at a specific time
  public async getWeatherForLocation(
    location: string, 
    targetTimestamp: number
  ): Promise<WeatherData | null> {
    const cacheKey = `${location}_${targetTimestamp}`;
    
    // Check cache first
    if (this.cache[cacheKey] && this.cache[cacheKey].expiry > Date.now()) {
      return this.cache[cacheKey].data;
    }
    
    try {
      // For demo purposes, we'll use mock data to avoid API key requirements
      const data = await this.fetchMockWeatherData(location, targetTimestamp);
      
      // Cache the result
      this.cache[cacheKey] = {
        data,
        expiry: Date.now() + this.cacheExpiryMs
      };
      
      return data;
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  }

  // This would normally call a real API, but for demo purposes we generate mock data
  private async fetchMockWeatherData(location: string, timestamp: number): Promise<WeatherData> {
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate pseudorandom but consistent weather for a location
    const locationHash = this.hashCode(location);
    const timeVariation = Math.floor(timestamp / (1000 * 60 * 60)) % 24; // Hour variation
    
    const weatherConditions = [
      { condition: "Clear", icon: "☀️" },
      { condition: "Partly Cloudy", icon: "⛅" },
      { condition: "Cloudy", icon: "☁️" },
      { condition: "Rainy", icon: "🌧️" },
      { condition: "Thunderstorm", icon: "⛈️" },
      { condition: "Snowy", icon: "❄️" },
      { condition: "Foggy", icon: "🌫️" }
    ];
    
    // Pick a condition based on location hash
    const conditionIndex = (locationHash + timeVariation) % weatherConditions.length;
    const condition = weatherConditions[conditionIndex];
    
    // Generate temperature (10-35°C with location/time variation)
    const baseTemp = 10 + (locationHash % 15);
    const tempVariation = 5 * Math.sin(timeVariation / 12 * Math.PI);
    const celsius = Math.round(baseTemp + tempVariation);
    const fahrenheit = Math.round(celsius * 9/5 + 32);
    
    // Random humidity (30-90%)
    const humidity = 30 + (locationHash + timeVariation) % 60;
    
    // Rain chance - higher if the condition includes rain
    let chanceOfRain = (locationHash + timeVariation) % 30;
    if (condition.condition.includes("Rain") || condition.condition.includes("Thunder")) {
      chanceOfRain += 40;
    }
    
    return {
      location,
      temperature: celsius,
      temperatureUnit: 'C',
      condition: condition.condition,
      icon: condition.icon,
      humidity,
      chanceOfRain: Math.min(chanceOfRain, 100), // Cap at 100%
      timestamp
    };
  }
  
  // Simple hash function for strings
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  // Clear cache
  public clearCache(): void {
    this.cache = {};
  }
}

export default new WeatherService();
