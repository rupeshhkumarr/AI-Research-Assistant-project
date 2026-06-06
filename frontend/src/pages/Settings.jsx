import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { getSettings, saveSettings } from '../services/settingsService';
import { useAppContext } from '../context/AppContext';
import { useThemeContext } from '../context/ThemeContext';
import { Save } from 'lucide-react';
import { Skeleton } from '../components/common/Skeleton';
import { VoiceSettings } from '../components/settings/VoiceSettings';

export default function Settings() {
  const { theme, setDarkTheme, setLightTheme } = useThemeContext();
  const [formData, setFormData] = useState({
    apiKey: '',
    chunkSize: 500,
    retrievalCount: 5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useAppContext();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        if (data) {
          setFormData({
            apiKey: data.apiKey || '',
            chunkSize: data.chunkSize || 500,
            retrievalCount: data.retrievalCount || 5,
          });
        }
      } catch (err) {
        addToast('Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [addToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSettings({
        ...formData,
        chunkSize: Number(formData.chunkSize),
        retrievalCount: Number(formData.retrievalCount),
      });
      addToast('Settings saved successfully', 'success');
    } catch (err) {
      addToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-text-main mb-1">Configuration</h2>
        <p className="text-text-muted">Manage your system preferences, API keys, and voice settings.</p>
      </div>

      <Card>
        {loading ? (
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-11 w-full" />
            </div>
            <Skeleton className="h-10 w-32 mt-4" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-main">Google Gemini API Key</label>
              <Input
                name="apiKey"
                type="password"
                value={formData.apiKey}
                onChange={handleChange}
                placeholder="AIzaSy..."
                autoComplete="off"
              />
              <p className="text-xs text-text-muted">Required for generating embeddings and chat responses.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-main">Text Chunk Size</label>
              <Input
                name="chunkSize"
                type="number"
                min="100"
                max="2000"
                value={formData.chunkSize}
                onChange={handleChange}
              />
              <p className="text-xs text-text-muted">Number of characters per document chunk (100-2000).</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-main">Retrieval Count (k)</label>
              <Input
                name="retrievalCount"
                type="number"
                min="1"
                max="20"
                value={formData.retrievalCount}
                onChange={handleChange}
              />
              <p className="text-xs text-text-muted">Number of relevant chunks to retrieve for context (1-20).</p>
            </div>

            <VoiceSettings />

            {/* Appearance Section */}
            <div className="pt-6 border-t border-border mt-2 space-y-4">
              <h3 className="text-sm font-medium text-text-main uppercase tracking-wider">Appearance</h3>
              
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${theme === 'light' ? 'border-primary-500' : 'border-border group-hover:border-text-muted'}`}>
                    {theme === 'light' && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                  </div>
                  <input type="radio" className="hidden" checked={theme === 'light'} onChange={setLightTheme} />
                  <span className="text-sm text-text-main font-medium">Light Mode</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${theme === 'dark' ? 'border-primary-500' : 'border-border group-hover:border-text-muted'}`}>
                    {theme === 'dark' && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                  </div>
                  <input type="radio" className="hidden" checked={theme === 'dark'} onChange={setDarkTheme} />
                  <span className="text-sm text-text-main font-medium">Dark Mode</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <Button type="submit" isLoading={saving} className="gap-2">
                <Save size={18} />
                Save Settings
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
