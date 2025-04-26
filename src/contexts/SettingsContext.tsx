
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserSettings {
  theme: 'dark' | 'light';
  timeFormat: '12h' | '24h';
  favoriteTimezones: string[];
  voiceInputDuration: number; // in seconds
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  timeFormat: '12h',
  favoriteTimezones: [],
  voiceInputDuration: 5,
};

interface SettingsContextType {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  addFavoriteTimezone: (timezoneId: string) => void;
  removeFavoriteTimezone: (timezoneId: string) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    // Load settings from localStorage or use defaults
    const savedSettings = localStorage.getItem('timeMapperSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('timeMapperSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const addFavoriteTimezone = (timezoneId: string) => {
    if (!settings.favoriteTimezones.includes(timezoneId)) {
      setSettings(prev => ({
        ...prev,
        favoriteTimezones: [...prev.favoriteTimezones, timezoneId]
      }));
    }
  };

  const removeFavoriteTimezone = (timezoneId: string) => {
    setSettings(prev => ({
      ...prev,
      favoriteTimezones: prev.favoriteTimezones.filter(id => id !== timezoneId)
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        addFavoriteTimezone,
        removeFavoriteTimezone,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Apply theme dynamically
export const ThemeApplier: React.FC = () => {
  const { settings } = useSettings();
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', settings.theme === 'dark');
    document.documentElement.classList.toggle('light-theme', settings.theme === 'light');
  }, [settings.theme]);

  return null;
};
