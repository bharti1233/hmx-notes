import { useState, useEffect, useCallback } from 'react';

export type AIProvider = 'gemini' | 'groq' | 'claude' | 'custom';

export interface AISettings {
  provider: AIProvider;
  geminiApiKey: string;
  groqApiKey: string;
  claudeApiKey: string;
  customUrl: string;
  customApiKey: string;
  systemPrompt: string;
}

const STORAGE_KEY = 'hmx-ai-settings';

const defaults: AISettings = {
  provider: 'gemini',
  geminiApiKey: '',
  groqApiKey: '',
  claudeApiKey: '',
  customUrl: '',
  customApiKey: '',
  systemPrompt: 'You are a helpful AI assistant for note-taking. Help the user organize, summarize, and enhance their notes.',
};

function load(): AISettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
  return defaults;
}

export function useAISettings() {
  const [settings, setSettings] = useState<AISettings>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = useCallback(<K extends keyof AISettings>(key: K, value: AISettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setSettings(defaults), []);

  return { settings, update, reset };
}
