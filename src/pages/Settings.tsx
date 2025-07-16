
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  Shield, 
  Palette, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff,
  Moon,
  Sun,
  Globe,
  Lock,
  Database,
  HelpCircle
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      mentions: true,
      updates: false
    },
    privacy: {
      profileVisible: true,
      memoriesPublic: false,
      allowComments: true,
      showLocation: false
    },
    appearance: {
      theme: 'light',
      language: 'en',
      dateFormat: 'MM/DD/YYYY'
    },
    security: {
      twoFactor: false,
      loginAlerts: true
    }
  });

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const SettingCard = ({ 
    title, 
    children, 
    icon: Icon 
  }: { 
    title: string; 
    children: React.ReactNode; 
    icon: any;
  }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const ToggleSwitch = ({ 
    checked, 
    onChange, 
    label, 
    description 
  }: { 
    checked: boolean; 
    onChange: (value: boolean) => void; 
    label: string; 
    description?: string;
  }) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{label}</div>
        {description && <div className="text-sm text-gray-500">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and privacy settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications */}
          <SettingCard title="Notifications" icon={Bell}>
            <ToggleSwitch
              checked={settings.notifications.email}
              onChange={(value) => updateSetting('notifications', 'email', value)}
              label="Email notifications"
              description="Receive updates via email"
            />
            <ToggleSwitch
              checked={settings.notifications.push}
              onChange={(value) => updateSetting('notifications', 'push', value)}
              label="Push notifications"
              description="Browser notifications"
            />
            <ToggleSwitch
              checked={settings.notifications.mentions}
              onChange={(value) => updateSetting('notifications', 'mentions', value)}
              label="Mentions"
              description="When someone mentions you"
            />
            <ToggleSwitch
              checked={settings.notifications.updates}
              onChange={(value) => updateSetting('notifications', 'updates', value)}
              label="Product updates"
              description="News about new features"
            />
          </SettingCard>

          {/* Privacy */}
          <SettingCard title="Privacy" icon={Shield}>
            <ToggleSwitch
              checked={settings.privacy.profileVisible}
              onChange={(value) => updateSetting('privacy', 'profileVisible', value)}
              label="Public profile"
              description="Make your profile visible to others"
            />
            <ToggleSwitch
              checked={settings.privacy.memoriesPublic}
              onChange={(value) => updateSetting('privacy', 'memoriesPublic', value)}
              label="Public memories"
              description="Allow others to see your memories"
            />
            <ToggleSwitch
              checked={settings.privacy.allowComments}
              onChange={(value) => updateSetting('privacy', 'allowComments', value)}
              label="Allow comments"
              description="Let others comment on your memories"
            />
            <ToggleSwitch
              checked={settings.privacy.showLocation}
              onChange={(value) => updateSetting('privacy', 'showLocation', value)}
              label="Show location"
              description="Display location data in memories"
            />
          </SettingCard>

          {/* Appearance */}
          <SettingCard title="Appearance" icon={Palette}>
            <div>
              <label className="block font-medium text-gray-900 mb-2">Theme</label>
              <div className="flex space-x-3">
                <button
                  onClick={() => updateSetting('appearance', 'theme', 'light')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                    settings.appearance.theme === 'light'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => updateSetting('appearance', 'theme', 'dark')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                    settings.appearance.theme === 'dark'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Dark</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block font-medium text-gray-900 mb-2">Language</label>
              <select
                value={settings.appearance.language}
                onChange={(e) => updateSetting('appearance', 'language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </SettingCard>

          {/* Security */}
          <SettingCard title="Security" icon={Lock}>
            <ToggleSwitch
              checked={settings.security.twoFactor}
              onChange={(value) => updateSetting('security', 'twoFactor', value)}
              label="Two-factor authentication"
              description="Add an extra layer of security"
            />
            <ToggleSwitch
              checked={settings.security.loginAlerts}
              onChange={(value) => updateSetting('security', 'loginAlerts', value)}
              label="Login alerts"
              description="Get notified of new logins"
            />
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
          </SettingCard>

          {/* Data Management */}
          <div className="lg:col-span-2">
            <SettingCard title="Data Management" icon={Database}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export Data</span>
                </Button>
                <Button variant="outline" className="flex items-center justify-center space-x-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Get Help</span>
                </Button>
                <Button variant="destructive" className="flex items-center justify-center space-x-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account</span>
                </Button>
              </div>
            </SettingCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
