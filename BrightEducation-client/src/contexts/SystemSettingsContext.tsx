import React, { createContext, useContext, useState, useEffect } from 'react';

import axiosInstance from '../lib/axios';



interface SystemSettings {

  id: string;

  timezone: string;

  testModeEnabled: boolean;

  testDate: string | null;

  createdAt: string;

  updatedAt: string;

}



interface SystemSettingsContextType {

  settings: SystemSettings | null;

  isLoading: boolean;

  isConfigured: boolean;

  refreshSettings: () => Promise<void>;

}



const SystemSettingsContext = createContext<SystemSettingsContextType>({

  settings: null,

  isLoading: true,

  isConfigured: false,

  refreshSettings: async () => {},

});



export const useSystemSettings = () => {

  const context = useContext(SystemSettingsContext);

  if (!context) {

    throw new Error('useSystemSettings must be used within a SystemSettingsProvider');

  }

  return context;

};



export const SystemSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const [isLoading, setIsLoading] = useState(true);



  const fetchSettings = async () => {

    try {

      const response = await axiosInstance.get('/system-settings');

      setSettings(response.data.body);

    } catch (error) {

      console.error('Failed to fetch system settings:', error);

    } finally {

      setIsLoading(false);

    }

  };



  const refreshSettings = async () => {

    await fetchSettings();

  };



  useEffect(() => {

    fetchSettings();

  }, []);



  const isConfigured = settings?.timezone && settings.timezone !== '';



  return (

    <SystemSettingsContext.Provider value={{ settings, isLoading, isConfigured, refreshSettings }}>

      {children}

    </SystemSettingsContext.Provider>

  );

};

