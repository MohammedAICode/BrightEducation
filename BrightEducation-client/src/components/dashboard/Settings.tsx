import { useState, useEffect } from 'react';
import axiosInstance from '../../lib/axios';
import { FiClock, FiCheck, FiAlertTriangle } from 'react-icons/fi';

interface SystemSettings {
  id: string;
  timezone: string;
  testModeEnabled: boolean;
  testDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'Asia/Kolkata', label: 'India (IST - Indian Standard Time)' },
  { value: 'America/New_York', label: 'New York (EST - Eastern Standard Time)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST - Pacific Standard Time)' },
  { value: 'America/Chicago', label: 'Chicago (CST - Central Standard Time)' },
  { value: 'Europe/London', label: 'London (GMT - Greenwich Mean Time)' },
  { value: 'Europe/Paris', label: 'Paris (CET - Central European Time)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET - Central European Time)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST - Japan Standard Time)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT - Singapore Time)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST - Gulf Standard Time)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST - Australian Eastern Time)' },
];

export function Settings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [testModeEnabled, setTestModeEnabled] = useState(false);
  const [testDate, setTestDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axiosInstance.get('/system-settings');
      const data = response.data.body;
      setSettings(data);
      setTimezone(data.timezone);
      setTestModeEnabled(data.testModeEnabled);
      setTestDate(data.testDate ? data.testDate.split('T')[0] : '');
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage({ type: 'error', text: 'Failed to load system settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await axiosInstance.patch('/system-settings', {
        timezone,
        testModeEnabled,
        testDate: testDate ? new Date(testDate).toISOString() : null,
      });

      await fetchSettings();
      setMessage({ type: 'success', text: 'Settings saved successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <FiCheck className="w-5 h-5" />
            ) : (
              <FiAlertTriangle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Timezone Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <FiClock className="w-4 h-4" />
                <span>System Timezone</span>
              </div>
            </label>
            <p className="text-sm text-gray-500 mb-3">
              This timezone will be used for all date/time calculations including fee schedules, notifications, and payment due dates.
            </p>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {/* Test Mode Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Test Mode
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={testModeEnabled}
                  onChange={(e) => setTestModeEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Enable test mode to override the current date for testing fee calculations and notification schedules.
            </p>

            {testModeEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Date
                </label>
                <input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This date will be used instead of the current date for all calculations.
                </p>
              </div>
            )}
          </div>

          {/* Current Settings Info */}
          {settings && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Current Settings</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Timezone:</span>
                  <span className="font-medium">{settings.timezone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Test Mode:</span>
                  <span className="font-medium">{settings.testModeEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                {settings.testDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Test Date:</span>
                    <span className="font-medium">{new Date(settings.testDate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{new Date(settings.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
