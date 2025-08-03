import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Thermometer } from 'lucide-react-native';

interface TemperatureCardProps {
  temperature: number;
}

export function TemperatureCard({ temperature }: TemperatureCardProps) {
  const getTemperatureColor = (temp: number) => {
  if (temp < 15) return '#3b82f6'; // Blue for cold
  if (temp < 25) return '#22c55e'; // Green for comfortable
  if (temp < 35) return '#f59e0b'; // Orange for warm
  return '#ef4444'; // Red for hot
};

  const color = getTemperatureColor(temperature);

  return (
    <View style={[styles.container, { borderLeftColor: color }]}>
      <View style={styles.header}>
        <Thermometer size={24} color={color} />
        <Text style={styles.label}>Temperature</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color }]}>{temperature}°C</Text>
        <Text style={styles.status}>
          {temperature < 15 ? 'Cold' : 
           temperature < 25 ? 'Comfortable' :
           temperature < 35 ? 'Warm' : 'Hot'}
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