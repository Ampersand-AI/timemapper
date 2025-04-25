
import React, { useState } from 'react';
import { formatToTimeZone } from '@/services/TimeUtils';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
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

export interface TimeZoneInfo {
  id: string;
  name: string;
  time: Date;
  isSource?: boolean;
  offset?: string; // Added missing offset property
  abbreviation?: string; // Also adding abbreviation for completeness
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
  const isSource = !!timeZone.isSource;

  const handleTimeZoneChange = (newZoneId: string) => {
    if (onTimeZoneChange) {
      onTimeZoneChange(timeZone.id, newZoneId);
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
            toast({
              title: "Timezone Found",
              description: `Matched ${customZone} to ${targetZone}`,
            });
          } else {
            // If AI said it's valid but didn't return a specific timezone
            fallbackSearch();
          }
        } else {
          toast({
            title: "Location Not Found",
            description: result.suggestions || "Could not find a matching timezone for this location",
            variant: "destructive",
          });
        }
      } else {
        // No API key, use basic matching
        fallbackSearch();
      }
    } catch (error) {
      console.error('Error setting custom timezone:', error);
      fallbackSearch();
    } finally {
      setSearching(false);
    }
  };

  const fallbackSearch = () => {
    // Enhanced timezone search logic
    const searchTerm = customZone.toLowerCase();
    
    // First try to find by country name (exact match)
    const countryMatch = timeZones.find(tz => 
      tz.countryName && tz.countryName.toLowerCase() === searchTerm
    );
    
    if (countryMatch) {
      handleTimeZoneChange(countryMatch.id);
      setCustomZone('');
      toast({
        title: "Country Found",
        description: `Matched ${customZone} to ${countryMatch.name}, ${countryMatch.countryName}`,
      });
      return;
    }
    
    // Try finding by city name or timezone ID
    const exactMatch = timeZones.find(tz => 
      tz.name.toLowerCase() === searchTerm ||
      tz.id.toLowerCase().includes(searchTerm) ||
      (tz.abbreviation && tz.abbreviation.toLowerCase() === searchTerm)
    );
    
    if (exactMatch) {
      handleTimeZoneChange(exactMatch.id);
      setCustomZone('');
      toast({
        title: "City Found",
        description: `Found exact match for ${customZone}`,
      });
      return;
    }
    
    // Try partial matching
    const partialMatch = timeZones.find(tz => 
      tz.name.toLowerCase().includes(searchTerm) ||
      tz.id.toLowerCase().includes(searchTerm) ||
      (tz.abbreviation && tz.abbreviation.toLowerCase().includes(searchTerm)) ||
      (tz.countryName && tz.countryName.toLowerCase().includes(searchTerm))
    );
    
    if (partialMatch) {
      handleTimeZoneChange(partialMatch.id);
      setCustomZone('');
      toast({
        title: "Location Found",
        description: `Matched ${customZone} to ${partialMatch.name}`,
      });
      return;
    }
    
    // If still no match, try fuzzy matching by extracting city names
    const fuzzyMatch = timeZones.find(tz => {
      const cityPart = tz.id.split('/').pop()?.toLowerCase().replace(/_/g, ' ');
      return cityPart?.includes(searchTerm);
    });
    
    if (fuzzyMatch) {
      handleTimeZoneChange(fuzzyMatch.id);
      setCustomZone('');
      toast({
        title: "Location Found",
        description: `Matched ${customZone} to ${fuzzyMatch.name}`,
      });
      return;
    }
    
    // No match found
    toast({
      title: "Location Not Found",
      description: "Could not find a matching timezone. Try a different city or connect an AI API for better matching",
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
                    onChange={(e) => setCustomZone(e.target.value)}
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
                {timeZones.map((zone) => (
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
              {formatToTimeZone(timeZone.time, timeZone.id, 'h:mm')}
            </div>
            <div className="text-3xl ml-2 font-medium">
              {formatToTimeZone(timeZone.time, timeZone.id, 'a')}
            </div>
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
