import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Droplets } from 'lucide-react-native';
import { HUMIDITY, BACKGROUND, TEXT, SHADOW } from '@/constants/colors';

interface HumidityCardProps {
  humidity: number;
}

export function HumidityCard({ humidity }: HumidityCardProps) {
    const getHumidityColor = (hum: number) => {
    if (hum < 30) return HUMIDITY.DRY;
    if (hum < 60) return HUMIDITY.MODERATE;
    if (hum < 80) return HUMIDITY.OPTIMAL;
    return HUMIDITY.HIGH;
  };

  const color = getHumidityColor(humidity);

  return (
    <View style={[styles.container, { borderLeftColor: color }]}>
      <View style={styles.header}>
        <Droplets size={24} color={color} />
        <Text style={styles.label}>Humidity</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color }]}>{Math.round(humidity)}%</Text>
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
    backgroundColor: BACKGROUND.CARD,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: SHADOW.PRIMARY,
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
    color: TEXT.LIGHT,
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
    color: TEXT.MUTED,
    fontWeight: '500',
  },
});