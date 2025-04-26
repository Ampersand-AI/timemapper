
import React from 'react';
import { Heart, HeartOff, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { findTimeZone, getCurrentTimeInZone, formatToTimeZone } from '@/services/TimeUtils';
import { toast } from '@/hooks/use-toast';

interface FavoriteTimezonesProps {
  onSelectTimezone: (timezoneId: string) => void;
}

const FavoriteTimezones: React.FC<FavoriteTimezonesProps> = ({ onSelectTimezone }) => {
  const { settings, removeFavoriteTimezone } = useSettings();
  
  if (settings.favoriteTimezones.length === 0) {
    return (
      <div className="neo-raised p-4 mb-4">
        <div className="text-center text-gray-400 py-4">
          <Heart className="w-6 h-6 mx-auto mb-2" />
          <p>Save your favorite timezones for quick access</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="neo-raised p-4 mb-4">
      <h2 className="text-lg font-semibold mb-3">Favorites</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {settings.favoriteTimezones.map(id => {
          const timezone = findTimeZone(id);
          if (!timezone) return null;
          
          const currentTime = getCurrentTimeInZone(id);
          const formattedTime = formatToTimeZone(
            currentTime,
            id,
            settings.timeFormat === '12h' ? 'h:mm a' : 'HH:mm'
          );
          
          return (
            <button
              key={id}
              onClick={() => onSelectTimezone(id)}
              className="neo-inset p-3 hover:bg-neo-inset/60 transition-colors text-left flex flex-col justify-between min-h-20"
            >
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm">{timezone.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavoriteTimezone(id);
                    toast({
                      title: "Removed from favorites",
                      description: `${timezone.name} has been removed from your favorites`,
                    });
                  }}
                >
                  <HeartOff className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-lg mt-2">{formattedTime}</div>
              <div className="text-xs text-gray-400">{timezone.countryName || timezone.abbreviation}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FavoriteTimezones;
