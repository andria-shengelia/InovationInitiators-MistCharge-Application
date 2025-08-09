import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Thermometer } from 'lucide-react-native';
import { TEMPERATURE, BACKGROUND, TEXT, BORDER, SHADOW } from '@/constants/colors';

interface TemperatureCardProps {
  temperature: number;
}

export function TemperatureCard({ temperature }: TemperatureCardProps) {
    const getTemperatureColor = (temp: number) => {
    if (temp < 15) return TEMPERATURE.COLD;
    if (temp < 25) return TEMPERATURE.COMFORTABLE;
    if (temp < 35) return TEMPERATURE.WARM;
    return TEMPERATURE.HOT;
  };

  const color = getTemperatureColor(temperature);

  return (
    <View style={[styles.container, { borderLeftColor: color }]}>
      <View style={styles.header}>
        <Thermometer size={24} color={color} />
        <Text style={styles.label}>Temperature</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color }]}>{temperature.toFixed(1)}°C</Text>
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