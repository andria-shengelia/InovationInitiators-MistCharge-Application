import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Droplets } from 'lucide-react-native';

interface HumidityCardProps {
  humidity: number;
}

export function HumidityCard({ humidity }: HumidityCardProps) {
  const getHumidityColor = (hum: number) => {
  if (hum < 30) return '#ef4444'; // Red for too dry
  if (hum < 60) return '#f59e0b'; // Orange for moderate
  if (hum < 80) return '#22c55e'; // Green for optimal
  return '#06b6d4'; // Cyan for high
};

  const color = getHumidityColor(humidity);

  return (
    <View style={[styles.container, { borderLeftColor: color }]}>
      <View style={styles.header}>
        <Droplets size={24} color={color} />
        <Text style={styles.label}>Humidity</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color }]}>{humidity}%</Text>
        <Text style={styles.status}>
          {humidity < 30 ? 'Too Dry' : 
           humidity < 60 ? 'Moderate' :
           humidity < 80 ? 'Optimal' : 'High'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 8,
  },
  valueContainer: {
    alignItems: 'flex-start',
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
});