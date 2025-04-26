
import React, { useState } from 'react';
import { formatToTimeZone } from '@/services/TimeUtils';
import { Button } from '@/components/ui/button';
import { Settings, Heart, HeartOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { timeZones } from '@/services/TimeUtils';
import GeminiService from '@/services/GeminiService';
import { toast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';

export interface TimeZoneInfo {
  id: string;
  name: string;
  time: Date;
  isSource?: boolean;
  offset?: string;
  abbreviation?: string;
}

export interface TimeTilesProps {
  timeZones: TimeZoneInfo[];
  onTimeZoneChange: (oldZoneId: string, newZoneId: string) => void;
}

const TimeTile: React.FC<{ 
  timeZone: TimeZoneInfo;
  onTimeZoneChange?: (oldZoneId: string, newZoneId: string) => void;
}> = ({ timeZone, onTimeZoneChange }) => {
  const [customZone, setCustomZone] = useState('');
  const [searching, setSearching] = useState(false);
  const [filteredZones, setFilteredZones] = useState<typeof timeZones>([]);
  const isSource = !!timeZone.isSource;
  const { settings, addFavoriteTimezone, removeFavoriteTimezone } = useSettings();
  const isFavorite = settings.favoriteTimezones.includes(timeZone.id);

  const handleTimeZoneChange = (newZoneId: string) => {
    if (onTimeZoneChange) {
      onTimeZoneChange(timeZone.id, newZoneId);
    }
  };

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavoriteTimezone(timeZone.id);
      toast({
        title: "Removed from favorites",
        description: `${timeZone.name} has been removed from your favorites`,
      });
    } else {
      addFavoriteTimezone(timeZone.id);
      toast({
        title: "Added to favorites",
        description: `${timeZone.name} has been added to your favorites`,
      });
    }
  };

  // Handle filtering as user types
  const handleFilterChange = (value: string) => {
    setCustomZone(value);
    
    if (value.trim().length >= 2) {
      // Filter zones based on input
      const filtered = timeZones.filter(tz => {
        const lowercaseValue = value.toLowerCase();
        return (
          tz.name.toLowerCase().includes(lowercaseValue) ||
          tz.id.toLowerCase().includes(lowercaseValue) ||
          (tz.countryName && tz.countryName.toLowerCase().includes(lowercaseValue)) ||
          (tz.abbreviation && tz.abbreviation.toLowerCase() === lowercaseValue) ||
          (tz.synonyms && tz.synonyms.some(s => s.includes(lowercaseValue)))
        );
      }).slice(0, 20); // Limit to prevent dropdown from being too large
      
      setFilteredZones(filtered);
    } else {
      setFilteredZones([]);
    }
  };

  const handleCustomZoneSubmit = async () => {
    if (!customZone.trim()) return;
    
    setSearching(true);

    try {
      if (GeminiService.hasApiKey()) {
        // Use Gemini to process the city/location name
        const query = `Time in ${customZone}`;
        const result = await GeminiService.verifyTimeQuery(query);
        
        if (result.isValid) {
          // AI identified a timezone or location
          const targetZone = result.toZone || result.fromZone;
          
          if (targetZone) {
            handleTimeZoneChange(targetZone);
            setCustomZone('');
            setFilteredZones([]);
            toast({
              title: "Timezone Found",
              description: `Matched ${customZone} to ${targetZone}`,
            });
          } else {
            // If AI said it's valid but didn't return a specific timezone
            enhancedFallbackSearch();
          }
        } else {
          enhancedFallbackSearch();
        }
      } else {
        // No API key, use enhanced matching
        enhancedFallbackSearch();
      }
    } catch (error) {
      console.error('Error setting custom timezone:', error);
      enhancedFallbackSearch();
    } finally {
      setSearching(false);
    }
  };

  const enhancedFallbackSearch = () => {
    // Enhanced timezone search logic with multiple fallbacks
    const searchTerm = customZone.toLowerCase().trim();
    
    // Try to find a match in our filtered results first
    if (filteredZones.length > 0) {
      handleTimeZoneChange(filteredZones[0].id);
      setCustomZone('');
      setFilteredZones([]);
      toast({
        title: "Location Found",
        description: `Matched ${customZone} to ${filteredZones[0].name}, ${filteredZones[0].countryName || ''}`,
      });
      return;
    }
    
    // Try exact match first
    for (const tz of timeZones) {
      // Perfect match on name, country, or abbreviation
      if (
        tz.name.toLowerCase() === searchTerm || 
        (tz.countryName && tz.countryName.toLowerCase() === searchTerm) ||
        tz.abbreviation.toLowerCase() === searchTerm ||
        (tz.synonyms && tz.synonyms.includes(searchTerm))
      ) {
        handleTimeZoneChange(tz.id);
        setCustomZone('');
        toast({
          title: "Location Found",
          description: `Found exact match for ${customZone}`,
        });
        return;
      }
    }
    
    // Try partial matches in city name (most common user search)
    const cityMatches = timeZones.filter(tz => 
      tz.name.toLowerCase().includes(searchTerm)
    );
    
    if (cityMatches.length > 0) {
      handleTimeZoneChange(cityMatches[0].id);
      setCustomZone('');
      toast({
        title: "City Found",
        description: `Matched ${customZone} to ${cityMatches[0].name}`,
      });
      return;
    }
    
    // Try partial matches in country name
    const countryMatches = timeZones.filter(tz => 
      (tz.countryName && tz.countryName.toLowerCase().includes(searchTerm))
    );
    
    if (countryMatches.length > 0) {
      handleTimeZoneChange(countryMatches[0].id);
      setCustomZone('');
      toast({
        title: "Country Found",
        description: `Matched ${customZone} to ${countryMatches[0].name}, ${countryMatches[0].countryName}`,
      });
      return;
    }
    
    // Try matches on timezone ID or synonyms
    const idMatches = timeZones.filter(tz => 
      tz.id.toLowerCase().includes(searchTerm) ||
      (tz.synonyms && tz.synonyms.some(syn => syn.includes(searchTerm)))
    );
    
    if (idMatches.length > 0) {
      handleTimeZoneChange(idMatches[0].id);
      setCustomZone('');
      toast({
        title: "Location Found",
        description: `Matched ${customZone} to ${idMatches[0].name}`,
      });
      return;
    }
    
    // Try fuzzy matching - extract words and look for partial matches
    const searchWords = searchTerm.split(/\s+/);
    for (const word of searchWords) {
      if (word.length < 3) continue; // Skip very short words
      
      const wordMatches = timeZones.filter(tz => 
        tz.name.toLowerCase().includes(word) ||
        (tz.countryName && tz.countryName.toLowerCase().includes(word)) ||
        (tz.synonyms && tz.synonyms.some(syn => syn.includes(word)))
      );
      
      if (wordMatches.length > 0) {
        handleTimeZoneChange(wordMatches[0].id);
        setCustomZone('');
        toast({
          title: "Location Found",
          description: `Matched "${word}" from "${customZone}" to ${wordMatches[0].name}`,
        });
        return;
      }
    }
    
    // No match found
    toast({
      title: "Location Not Found",
      description: "Could not find a matching timezone. Try a different city or country name.",
      variant: "destructive",
    });
  };
  
  return (
    <div className={`neo-raised p-6 ${isSource ? 'border-neo-my-accent/30' : 'border-neo-their-accent/30'}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`text-lg font-medium ${isSource ? 'text-gradient-teal' : 'text-gradient-orange'}`}>
              {timeZone.name}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleFavorite}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? <HeartOff className="h-4 w-4 text-neo-my-accent" /> : <Heart className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px] bg-neo-background border border-gray-700 max-h-[400px] overflow-y-auto">
                <div className="p-2 sticky top-0 bg-neo-background z-10 border-b border-gray-700">
                  <Input
                    placeholder="Enter city, state, country or timezone..."
                    value={customZone}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="mb-2"
                  />
                  <Button 
                    onClick={handleCustomZoneSubmit}
                    className="w-full"
                    disabled={searching}
                  >
                    {searching ? 'Searching...' : 'Set Location'}
                  </Button>
                </div>
                <DropdownMenuSeparator />
                {(filteredZones.length > 0 ? filteredZones : timeZones).map((zone) => (
                  <DropdownMenuItem
                    key={zone.id}
                    onClick={() => handleTimeZoneChange(zone.id)}
                    className="text-white hover:bg-gray-700"
                  >
                    {zone.name} {zone.countryName && `(${zone.countryName})`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-xs text-gray-400 mt-1">{timeZone.id}</p>
        </div>
        <div className={`text-xs px-2 py-1 rounded-full ${isSource ? 'bg-neo-my-accent/20 text-neo-my-accent' : 'bg-neo-their-accent/20 text-neo-their-accent'}`}>
          {isSource ? 'Your Time' : 'Their Time'}
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex flex-col items-center">
          <div className="flex items-baseline">
            <div className="text-7xl font-bold tracking-tight">
              {formatToTimeZone(timeZone.time, timeZone.id, settings.timeFormat === '12h' ? 'h:mm' : 'HH:mm')}
            </div>
            {settings.timeFormat === '12h' && (
              <div className="text-3xl ml-2 font-medium">
                {formatToTimeZone(timeZone.time, timeZone.id, 'a')}
              </div>
            )}
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-xl text-white mt-2 font-medium">
              {formatToTimeZone(timeZone.time, timeZone.id, 'EEEE')}
            </div>
            <div className="text-lg text-gray-300">
              {formatToTimeZone(timeZone.time, timeZone.id, 'MMMM d, yyyy')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimeTiles: React.FC<TimeTilesProps> = ({ timeZones, onTimeZoneChange }) => {
  if (!timeZones.length) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {timeZones.map(zone => (
        <TimeTile 
          key={zone.id} 
          timeZone={zone} 
          onTimeZoneChange={onTimeZoneChange}
        />
      ))}
    </div>
  );
};

export default TimeTiles;
