import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSettings, storeSettings } from '../utils/offlineStorage';

interface NetworkIndicatorSettingsProps {
  onSettingsChange?: () => void;
}

export interface NetworkIndicatorSettings {
  showIndicator: boolean;
  subtleMode: boolean;
  showFloatingIndicator: boolean;
  autoHide: boolean;
}

const DEFAULT_SETTINGS: NetworkIndicatorSettings = {
  showIndicator: true,
  subtleMode: true,
  showFloatingIndicator: true,
  autoHide: true,
};

export function NetworkIndicatorSettings({ onSettingsChange }: NetworkIndicatorSettingsProps) {
  const [settings, setSettings] = useState<NetworkIndicatorSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await getSettings();
      const networkSettings: NetworkIndicatorSettings = {
        showIndicator: storedSettings.showNetworkIndicator ?? true,
        subtleMode: storedSettings.networkIndicatorSubtleMode ?? true,
        showFloatingIndicator: storedSettings.showFloatingIndicator ?? true,
        autoHide: storedSettings.autoHideIndicator ?? true,
      };
      setSettings(networkSettings);
    } catch (error) {
      console.error('Error loading network indicator settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof NetworkIndicatorSettings, value: boolean) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      // Map to storage keys
      const storageKey = {
        showIndicator: 'showNetworkIndicator',
        subtleMode: 'networkIndicatorSubtleMode',
        showFloatingIndicator: 'showFloatingIndicator',
        autoHide: 'autoHideIndicator',
      }[key];
      
      await storeSettings({ [storageKey]: value });
      onSettingsChange?.();
    } catch (error) {
      console.error('Error updating network indicator setting:', error);
      Alert.alert('Error', 'Failed to save setting');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="wifi" size={24} color="#007AFF" />
        <Text style={styles.title}>Network Indicator</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Show Network Status</Text>
            <Text style={styles.settingDescription}>
              Display connection status indicators
            </Text>
          </View>
          <Switch
            value={settings.showIndicator}
            onValueChange={(value) => updateSetting('showIndicator', value)}
            trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
            thumbColor={settings.showIndicator ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>

        {settings.showIndicator && (
          <>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Subtle Mode</Text>
                <Text style={styles.settingDescription}>
                  Use thin border instead of floating indicator
                </Text>
              </View>
              <Switch
                value={settings.subtleMode}
                onValueChange={(value) => updateSetting('subtleMode', value)}
                trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
                thumbColor={settings.subtleMode ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>

            {!settings.subtleMode && (
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Floating Indicator</Text>
                  <Text style={styles.settingDescription}>
                    Show expandable status bar when offline
                  </Text>
                </View>
                <Switch
                  value={settings.showFloatingIndicator}
                  onValueChange={(value) => updateSetting('showFloatingIndicator', value)}
                  trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
                  thumbColor={settings.showFloatingIndicator ? '#FFFFFF' : '#F4F3F4'}
                />
              </View>
            )}

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Auto Hide</Text>
                <Text style={styles.settingDescription}>
                  Automatically hide indicators after delay
                </Text>
              </View>
              <Switch
                value={settings.autoHide}
                onValueChange={(value) => updateSetting('autoHide', value)}
                trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
                thumbColor={settings.autoHide ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>
          </>
        )}
      </View>

      <View style={styles.preview}>
        <Text style={styles.previewTitle}>Preview</Text>
        <View style={styles.previewContainer}>
          <View style={[
            styles.previewIndicator,
            {
              borderColor: settings.showIndicator ? '#FF9500' : 'transparent',
              borderWidth: settings.showIndicator ? (settings.subtleMode ? 1 : 2) : 0,
              opacity: settings.showIndicator ? (settings.subtleMode ? 0.3 : 0.6) : 0,
            }
          ]}>
            <Text style={styles.previewText}>App Content</Text>
            {settings.showIndicator && !settings.subtleMode && settings.showFloatingIndicator && (
              <View style={[styles.previewFloating, { backgroundColor: '#FF9500' }]}>
                <Text style={styles.previewFloatingText}>Offline Mode</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  preview: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  previewContainer: {
    alignItems: 'center',
  },
  previewIndicator: {
    width: 200,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  previewText: {
    fontSize: 14,
    color: '#666',
  },
  previewFloating: {
    position: 'absolute',
    top: -30,
    left: 20,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  previewFloatingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
}); 