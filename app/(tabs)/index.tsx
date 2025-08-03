import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { TemperatureCard } from '@/components/TemperatureCard';
import { HumidityCard } from '@/components/HumidityCard';
import { WaterCollectionCard } from '@/components/WaterCollectionCard';
import { BatteryCard } from '@/components/BatteryCard';
import { WaterQualityCard } from '@/components/WaterQualityCard';
import { StatisticsChart } from '@/components/StatisticsChart';
import { PowerControl } from '@/components/PowerControl';
import { useRealIoTData } from '@/hooks/useRealIoTData';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const { data, weeklyStats, loading, error, refreshData, togglePower } = useRealIoTData();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        
        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading IoT data...</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <Text style={styles.errorSubtext}>Check if the IoT server is running</Text>
          </View>
        )}

        {/* Top Panel - Temperature & Humidity */}
        <View style={styles.topPanel}>
          <TemperatureCard temperature={data.temperature} />
          <HumidityCard humidity={data.humidity} />
        </View>

        {/* Water Collection */}
        <WaterCollectionCard 
          current={data.waterLevel} 
          capacity={data.waterCapacity} 
        />

        {/* Battery */}
        <BatteryCard percentage={data.batteryLevel} />

        {/* Water Quality */}
        <WaterQualityCard quality={data.waterQuality} />

        {/* Statistics Chart */}
        <StatisticsChart data={weeklyStats} />

        {/* Power Control */}
        <PowerControl 
          isOn={data.isPoweredOn} 
          onToggle={togglePower} 
        />

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
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '400',
  },
  content: {
    flex: 1,
  },
  topPanel: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  bottomSpacing: {
    height: 100,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#fef2f2',
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '600',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#991b1b',
  },
});