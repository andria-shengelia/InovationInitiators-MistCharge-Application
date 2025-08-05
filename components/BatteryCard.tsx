import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Battery } from 'lucide-react-native';
import { CircularProgress } from './CircularProgress';
import { BATTERY, BACKGROUND, TEXT, SHADOW } from '@/constants/colors';

interface BatteryCardProps {
  percentage: number;
}

export function BatteryCard({ percentage }: BatteryCardProps) {
    const getBatteryColor = (level: number) => {
    if (level > 60) return BATTERY.GOOD;
    if (level > 30) return BATTERY.MEDIUM;
    return BATTERY.LOW;
  };

  const color = getBatteryColor(percentage);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Battery size={24} color={color} />
        <Text style={styles.label}>Battery Level</Text>
      </View>
      
      <View style={styles.content}>
        <CircularProgress 
          percentage={percentage} 
          size={120}
          strokeWidth={12}
          color={color}
        />
        <View style={styles.info}>
          <Text style={styles.status}>
            {percentage > 60 ? 'Excellent' :
             percentage > 30 ? 'Good' :
             percentage > 15 ? 'Low' : 'Critical'}
          </Text>
          <Text style={styles.estimatedTime}>
            {percentage > 60 ? '~12h remaining' :
             percentage > 30 ? '~6h remaining' :
             percentage > 15 ? '~2h remaining' : 'Charge needed'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BACKGROUND.CARD,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
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
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT.MEDIUM,
    marginLeft: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 24,
  },
  status: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT.DARK,
    marginBottom: 4,
  },
  estimatedTime: {
    fontSize: 14,
    color: TEXT.LIGHT,
    fontWeight: '500',
  },
});