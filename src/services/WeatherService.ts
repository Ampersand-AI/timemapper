
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
      // For demo purposes, we'll use enhanced mock data to improve accuracy
      const data = await this.fetchEnhancedWeatherData(location, targetTimestamp);
      
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

  // Enhanced weather data generation with more realistic patterns
  private async fetchEnhancedWeatherData(location: string, timestamp: number): Promise<WeatherData> {
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Normalize location name for consistency
    const normalizedLocation = location.toLowerCase().trim();
    
    // Generate location-based seed for consistent yet realistic weather
    const locationHash = this.hashCode(normalizedLocation);
    
    // Calculate time components for better time-based variations
    const targetDate = new Date(timestamp);
    const month = targetDate.getMonth(); // 0-11
    const hour = targetDate.getHours(); // 0-23
    const dayOfYear = Math.floor((timestamp - new Date(targetDate.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Weather patterns based on geographic regions
    const isNorthernHemisphere = !this.isSouthernHemisphere(normalizedLocation);
    const isTropical = this.isTropicalRegion(normalizedLocation);
    const isDesert = this.isDesertRegion(normalizedLocation);
    const isCoastal = this.isCoastalRegion(normalizedLocation);
    const isMountainous = this.isMountainousRegion(normalizedLocation);
    
    // Seasonal adjustments (reverse for southern hemisphere)
    const isWinter = isNorthernHemisphere ? (month < 2 || month > 10) : (month > 3 && month < 10);
    const isSummer = isNorthernHemisphere ? (month > 4 && month < 9) : (month < 3 || month > 9);
    const isSpringFall = !isWinter && !isSummer;
    
    // Base temperature based on location and season
    let baseTemp;
    if (isTropical) {
      baseTemp = 25 + (locationHash % 5); // 25-30°C in tropical regions
    } else if (isDesert) {
      baseTemp = isSummer ? 35 + (locationHash % 10) : 15 + (locationHash % 10); // Hot days, cooler nights
    } else if (isMountainous) {
      baseTemp = isSummer ? 15 + (locationHash % 8) : 0 - (locationHash % 10); // Cooler in mountains
    } else {
      // Standard regions
      if (isSummer) {
        baseTemp = 20 + (locationHash % 15); // 20-35°C in summer
      } else if (isWinter) {
        baseTemp = isNorthernHemisphere ? 0 - (locationHash % 15) : 5 + (locationHash % 10); // Colder in northern winters
      } else {
        baseTemp = 10 + (locationHash % 15); // 10-25°C in spring/fall
      }
    }
    
    // Day/night cycle variations
    const isDaytime = hour >= 6 && hour <= 18;
    const tempVariation = isDaytime ? 5 * Math.sin((hour - 6) / 12 * Math.PI) : -5 + (locationHash % 3);
    
    // Coastal areas have less temperature variation
    const finalTempVariation = isCoastal ? tempVariation / 2 : tempVariation;
    
    // Calculate final temperature with seasonal and daily variations
    const celsius = Math.round(baseTemp + finalTempVariation);
    const fahrenheit = Math.round(celsius * 9/5 + 32);
    
    // Weather condition selection based on region, season, and time
    const weatherConditions = [
      { condition: "Clear", icon: "☀️", rainChance: 0, humidityBase: 30 },
      { condition: "Partly Cloudy", icon: "⛅", rainChance: 10, humidityBase: 45 },
      { condition: "Cloudy", icon: "☁️", rainChance: 25, humidityBase: 60 },
      { condition: "Rainy", icon: "🌧️", rainChance: 70, humidityBase: 80 },
      { condition: "Thunderstorm", icon: "⛈️", rainChance: 90, humidityBase: 85 },
      { condition: "Snowy", icon: "❄️", rainChance: 0, humidityBase: 70 },
      { condition: "Foggy", icon: "🌫️", rainChance: 20, humidityBase: 90 }
    ];
    
    // Adjust probability based on region and season
    let conditionWeights = [];
    
    if (isDesert) {
      conditionWeights = [0.7, 0.2, 0.1, 0, 0, 0, 0]; // Mostly clear in deserts
    } else if (isTropical) {
      conditionWeights = [0.3, 0.3, 0.1, 0.2, 0.1, 0, 0]; // Mix of sun and rain
    } else if (isCoastal) {
      conditionWeights = [0.2, 0.3, 0.2, 0.15, 0.05, 0, 0.1]; // More clouds, some fog
    } else if (isMountainous) {
      conditionWeights = [0.2, 0.2, 0.2, 0.1, 0.1, 0.1, 0.1]; // Variable conditions
    } else if (isWinter && !isTropical) {
      conditionWeights = [0.1, 0.2, 0.3, 0.1, 0, 0.2, 0.1]; // More clouds and snow in winter
    } else if (isSummer) {
      conditionWeights = [0.4, 0.3, 0.1, 0.1, 0.1, 0, 0]; // Mostly sunny in summer
    } else {
      conditionWeights = [0.2, 0.3, 0.3, 0.1, 0.05, 0, 0.05]; // Variable in spring/fall
    }
    
    // Make sure snow only happens when it's cold enough
    if (celsius > 2) {
      // Redistribute snow weight to other conditions
      const snowIndex = 5;
      const snowWeight = conditionWeights[snowIndex];
      conditionWeights[snowIndex] = 0;
      
      // Distribute to other conditions proportionally
      const totalOtherWeights = conditionWeights.reduce((sum, w, i) => i !== snowIndex ? sum + w : sum, 0);
      if (totalOtherWeights > 0) {
        conditionWeights = conditionWeights.map((w, i) => 
          i !== snowIndex ? w + (snowWeight * w / totalOtherWeights) : 0
        );
      }
    }
    
    // Select condition based on weighted random selection
    const conditionIndex = this.weightedRandom(conditionWeights, (locationHash + dayOfYear) % 100);
    const condition = weatherConditions[conditionIndex];
    
    // Humidity - varied by condition and daily cycle
    let humidity = condition.humidityBase;
    
    // Adjust for location type
    if (isDesert) humidity -= 20;
    if (isTropical) humidity += 15;
    if (isCoastal) humidity += 10;
    
    // Time of day adjustment
    if (!isDaytime) humidity += 10;
    
    // Small random variation
    humidity += (locationHash + hour) % 10 - 5;
    
    // Rain chance - based on condition with some variation
    let chanceOfRain = condition.rainChance;
    
    // Adjust for time of day and season
    if (!isDaytime && chanceOfRain > 0) chanceOfRain += 10; // More likely at night
    if (isSummer && isNorthernHemisphere) chanceOfRain += 5; // Summer storms in north
    
    // Adjust for location
    if (isDesert) chanceOfRain -= 15;
    if (isTropical && isSummer) chanceOfRain += 20;
    
    // Ensure values are within valid ranges
    humidity = Math.max(10, Math.min(100, humidity));
    chanceOfRain = Math.max(0, Math.min(100, chanceOfRain));
    
    return {
      location,
      temperature: celsius,
      temperatureUnit: 'C',
      condition: condition.condition,
      icon: condition.icon,
      humidity,
      chanceOfRain,
      timestamp
    };
  }
  
  // Helper to determine if a location is likely in the southern hemisphere
  private isSouthernHemisphere(location: string): boolean {
    const southernLocations = [
      'australia', 'sydney', 'melbourne', 'perth', 'adelaide', 'brisbane',
      'new zealand', 'auckland', 'wellington',
      'argentina', 'buenos aires', 'brazil', 'rio', 'sao paulo',
      'chile', 'santiago', 'peru', 'lima',
      'south africa', 'cape town', 'johannesburg',
      'tanzania', 'madagascar', 'mauritius', 'uruguay', 'paraguay'
    ];
    
    return southernLocations.some(south => location.includes(south));
  }
  
  // Helper to determine if a location is likely tropical
  private isTropicalRegion(location: string): boolean {
    const tropicalLocations = [
      'miami', 'hawaii', 'caribbean', 'cuba', 'jamaica', 'bahamas',
      'mexico', 'cancun', 'brazil', 'rio', 'thailand', 'bangkok',
      'philippines', 'manila', 'vietnam', 'malaysia', 'singapore',
      'indonesia', 'bali', 'jakarta', 'india', 'mumbai', 'chennai',
      'africa', 'kenya', 'nigeria', 'ghana', 'egypt', 'saudi'
    ];
    
    return tropicalLocations.some(tropical => location.includes(tropical));
  }
  
  // Helper to determine if a location is likely desert
  private isDesertRegion(location: string): boolean {
    const desertLocations = [
      'desert', 'sahara', 'arizona', 'phoenix', 'nevada', 'las vegas',
      'dubai', 'qatar', 'saudi', 'arabia', 'egypt', 'cairo',
      'jordan', 'israel', 'morocco', 'algeria', 'iraq'
    ];
    
    return desertLocations.some(desert => location.includes(desert));
  }
  
  // Helper to determine if a location is likely coastal
  private isCoastalRegion(location: string): boolean {
    const coastalLocations = [
      'beach', 'coast', 'island', 'sea', 'ocean',
      'san francisco', 'los angeles', 'seattle', 'portland',
      'miami', 'boston', 'new york', 'sydney', 'melbourne',
      'vancouver', 'tokyo', 'hong kong', 'singapore', 'dubai',
      'barcelona', 'venice', 'marseille', 'nice',
      'lisbon', 'porto', 'cape town', 'rio'
    ];
    
    return coastalLocations.some(coastal => location.includes(coastal));
  }
  
  // Helper to determine if a location is likely mountainous
  private isMountainousRegion(location: string): boolean {
    const mountainLocations = [
      'mountain', 'alps', 'andes', 'himalaya', 'rockies', 
      'denver', 'boulder', 'aspen', 'vail', 'salt lake', 
      'switzerland', 'nepal', 'tibet', 'austria', 'alps',
      'pyrenees', 'norway', 'sweden', 'finland'
    ];
    
    return mountainLocations.some(mountain => location.includes(mountain));
  }
  
  // Simple weighted random selection
  private weightedRandom(weights: number[], seed: number): number {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = (seed / 100) * totalWeight;
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) return i;
    }
    
    return weights.length - 1;
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
