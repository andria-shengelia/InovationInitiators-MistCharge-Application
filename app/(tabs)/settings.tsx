import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { 
  Wifi, 
  Bell, 
  Info, 
  RefreshCw,
} from 'lucide-react-native';

export default function Settings() {
  const [notifications, setNotifications] = React.useState(true);
  const [autoRefresh, setAutoRefresh] = React.useState(true);


  const handleDeviceInfo = () => {
    Alert.alert(
      'Device Information',
      'Device ID: AWG-001\nFirmware: v2.1.3\nSerial: MST-2024-001\nManufactured: Jan 2024',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Device Configuration</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Connection Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Wifi size={24} color="#22c55e" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>AWS IoT Core</Text>
                  <Text style={styles.settingValue}>Connected</Text>
                </View>
              </View>
              <View style={[styles.statusDot, { backgroundColor: '#22c55e' }]} />
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Bell size={24} color="#3b82f6" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingValue}>
                    {notifications ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#e2e8f0', true: '#a67c52' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Data & Sync */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Sync</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <RefreshCw size={24} color="#3b82f6" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Auto Refresh</Text>
                  <Text style={styles.settingValue}>Every 30 seconds</Text>
                </View>
              </View>
              <Switch
                value={autoRefresh}
                onValueChange={setAutoRefresh}
                trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>


        {/* Device Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Information</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingItem} onPress={handleDeviceInfo}>
              <View style={styles.settingInfo}>
                <Info size={24} color="#3b82f6" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Device Information</Text>
                  <Text style={styles.settingValue}>View device details</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3cfc4',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 16,
  },
  bottomSpacing: {
    height: 100,
  },
});