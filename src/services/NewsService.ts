
// News service to fetch headlines for a location

export interface NewsItem {
  title: string;
  summary: string;
  source: string;
  url: string; // We'll keep this in the interface but not display it
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
      const newsItems = await this.fetchMockBusinessNewsData(location);
      
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

  // Mock business news data generation
  private async fetchMockBusinessNewsData(location: string): Promise<NewsItem[]> {
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Different mock business headlines for different locations
    const locationHeadlines: Record<string, NewsItem[]> = {
      "New York": [
        {
          title: "Wall Street Reports Record Q1 Profits",
          summary: "Major financial institutions exceed analyst expectations with strong performance.",
          source: "Financial Times",
          url: "#"
        },
        {
          title: "Tech Startup Funding Reaches $10B in NYC",
          summary: "Venture capital investments in New York tech sector show significant growth.",
          source: "NY Business Journal",
          url: "#"
        },
        {
          title: "Commercial Real Estate Market Stabilizing",
          summary: "Office occupancy rates beginning to recover in Manhattan business district.",
          source: "Commercial Property News",
          url: "#"
        }
      ],
      "London": [
        {
          title: "Bank of England Holds Interest Rates",
          summary: "Central bank maintains current rates amid inflation concerns and economic growth.",
          source: "The Economist",
          url: "#"
        },
        {
          title: "Brexit Impact on Financial Services Less Than Feared",
          summary: "New report shows London maintaining position as Europe's financial hub.",
          source: "Financial News",
          url: "#"
        },
        {
          title: "Sustainable Investment Funds See Record Growth",
          summary: "ESG-focused investments now represent 30% of all new capital in UK markets.",
          source: "Investment Weekly",
          url: "#"
        }
      ],
      "Tokyo": [
        {
          title: "Bank of Japan Adjusts Monetary Policy",
          summary: "Central bank shifts stance on yield curve control amid inflation concerns.",
          source: "Nikkei",
          url: "#"
        },
        {
          title: "Toyota Announces $10B Investment in EV Production",
          summary: "Japan's largest automaker accelerates electric vehicle manufacturing strategy.",
          source: "Business Japan",
          url: "#"
        },
        {
          title: "SoftBank Reports Strong Vision Fund Performance",
          summary: "Tech investments deliver positive returns after previous volatility.",
          source: "Tech Investor News",
          url: "#"
        }
      ],
      "Sydney": [
        {
          title: "Australian Central Bank Raises Interest Rates",
          summary: "Rate hike aims to control inflation while maintaining economic growth.",
          source: "Australian Financial Review",
          url: "#"
        },
        {
          title: "Mining Sector Reports Record Exports",
          summary: "Resources industry continues to drive Australian economic performance.",
          source: "Mining Journal",
          url: "#"
        },
        {
          title: "Tech Industry Growth Attracts Global Talent",
          summary: "Australian startups benefit from new visa program for tech specialists.",
          source: "Tech Daily",
          url: "#"
        }
      ],
      "Paris": [
        {
          title: "French Luxury Goods Sector Posts Strong Growth",
          summary: "LVMH and Kering report increased sales in Asian and American markets.",
          source: "Business France",
          url: "#"
        },
        {
          title: "Macron's Economic Reforms Show Initial Success",
          summary: "Business confidence rising as regulatory changes take effect.",
          source: "European Business Review",
          url: "#"
        },
        {
          title: "Renewable Energy Investment Hits Record High",
          summary: "French companies leading EU green transition with major infrastructure projects.",
          source: "Energy Finance",
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
    
    // Default business headlines if location not found
    return [
      {
        title: "Global Markets Show Resilience Amid Uncertainty",
        summary: "Major indices maintain stability despite geopolitical tensions.",
        source: "World Business Report",
        url: "#"
      },
      {
        title: "Supply Chain Innovations Reduce Global Logistics Costs",
        summary: "New technologies helping businesses overcome recent supply chain challenges.",
        source: "Supply Chain Digest",
        url: "#"
      },
      {
        title: "Sustainable Business Practices Driving Corporate Profits",
        summary: "Companies with strong ESG policies outperforming market averages.",
        source: "Business Sustainability",
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
