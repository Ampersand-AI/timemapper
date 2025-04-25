
// News service to fetch headlines for a location

export interface NewsItem {
  title: string;
  summary: string;
  source: string;
  url: string;
}

interface NewsCache {
  [locationKey: string]: {
    data: NewsItem[];
    expiry: number;
  };
}

class NewsService {
  private cache: NewsCache = {};
  private cacheExpiryMs = 30 * 60 * 1000; // 30 minutes

  // Get news for a location
  public async getNewsForLocation(location: string): Promise<NewsItem[]> {
    // Check cache first
    if (this.cache[location] && this.cache[location].expiry > Date.now()) {
      return this.cache[location].data;
    }
    
    try {
      // For demo purposes, we'll use mock data to avoid API key requirements
      const newsItems = await this.fetchMockNewsData(location);
      
      // Cache the result
      this.cache[location] = {
        data: newsItems,
        expiry: Date.now() + this.cacheExpiryMs
      };
      
      return newsItems;
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }

  // Mock news data generation
  private async fetchMockNewsData(location: string): Promise<NewsItem[]> {
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Different mock headlines for different locations
    const locationHeadlines: Record<string, NewsItem[]> = {
      "New York": [
        {
          title: "Central Park Renovation Enters Final Phase",
          summary: "The long-awaited central park renovation project will be completed next month.",
          source: "NY Times",
          url: "#"
        },
        {
          title: "NYC Marathon Sets New Participation Record",
          summary: "This year's marathon saw over 52,000 runners from 130 countries.",
          source: "NY Post",
          url: "#"
        },
        {
          title: "Broadway Attendance Surges in Post-Pandemic Era",
          summary: "Ticket sales are up 40% compared to last year as tourists return to the city.",
          source: "Broadway News",
          url: "#"
        }
      ],
      "London": [
        {
          title: "New Underground Line Opens to Public",
          summary: "The Elizabeth Line is now fully operational, connecting east and west London.",
          source: "The Guardian",
          url: "#"
        },
        {
          title: "Thames Barrier Celebrates 40 Years of Flood Protection",
          summary: "The iconic flood defense system has protected London 200 times since opening.",
          source: "BBC",
          url: "#"
        },
        {
          title: "London Tech Week Draws Record Attendance",
          summary: "Over 45,000 tech professionals attended the week-long innovation showcase.",
          source: "Tech Crunch",
          url: "#"
        }
      ],
      "Tokyo": [
        {
          title: "New Bullet Train Route Connects Tokyo and Sapporo",
          summary: "The new Shinkansen line cuts travel time between the cities by half.",
          source: "Japan Times",
          url: "#"
        },
        {
          title: "Tokyo's Oldest Sakura Tree Blooms Early",
          summary: "The 400-year-old cherry tree at Yasukuni Shrine has bloomed two weeks ahead of schedule.",
          source: "Asahi Shimbun",
          url: "#"
        },
        {
          title: "Robot Cafe in Shibuya Expands After Viral Success",
          summary: "The popular cafe will open three new locations across the city next month.",
          source: "Tokyo Weekly",
          url: "#"
        }
      ],
      "Sydney": [
        {
          title: "Opera House to Undergo Historic Renovation",
          summary: "The $200M project will preserve the landmark while improving acoustics.",
          source: "Sydney Morning Herald",
          url: "#"
        },
        {
          title: "Record Coral Bloom Reported at Great Barrier Reef",
          summary: "Scientists report unprecedented recovery in northern sections of the reef.",
          source: "Australian Geographic",
          url: "#"
        },
        {
          title: "Sydney Film Festival Announces International Lineup",
          summary: "Over 200 films from 60 countries will be screened during the two-week event.",
          source: "Screen Daily",
          url: "#"
        }
      ],
      "Paris": [
        {
          title: "Eiffel Tower Lighting System Gets Eco-Friendly Upgrade",
          summary: "New LED system reduces the monument's energy consumption by 40%.",
          source: "Le Monde",
          url: "#"
        },
        {
          title: "Paris Metro Extends Hours for Summer Festival Season",
          summary: "Lines 1 and 2 will run until 2 AM on weekends through September.",
          source: "France 24",
          url: "#"
        },
        {
          title: "Louvre Unveils New Da Vinci Restoration",
          summary: "Years of work reveal new details in the Renaissance masterpiece.",
          source: "Art News",
          url: "#"
        }
      ]
    };
    
    // Check if we have headlines for this location
    for (const [key, headlines] of Object.entries(locationHeadlines)) {
      if (location.includes(key) || key.includes(location)) {
        return headlines;
      }
    }
    
    // Default headlines if location not found
    return [
      {
        title: "Global Climate Summit Reaches New Agreement",
        summary: "195 countries sign pledge to reduce carbon emissions by 50% before 2030.",
        source: "World News",
        url: "#"
      },
      {
        title: "International Space Station Celebrates 25 Years",
        summary: "The orbiting laboratory has hosted astronauts from 20 countries since 1998.",
        source: "Space Today",
        url: "#"
      },
      {
        title: "Global Economic Forum Predicts Growth in Tech Sector",
        summary: "AI and renewable energy expected to drive economic expansion next year.",
        source: "Financial Times",
        url: "#"
      }
    ];
  }
  
  // Clear cache
  public clearCache(): void {
    this.cache = {};
  }
}

export default new NewsService();
