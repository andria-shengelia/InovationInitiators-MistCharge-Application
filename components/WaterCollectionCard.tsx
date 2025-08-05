import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Droplets } from 'lucide-react-native';
import { WATER, BACKGROUND, TEXT, PROGRESS, SHADOW } from '@/constants/colors';

interface WaterCollectionCardProps {
  current: number;
  capacity: number;
}

export function WaterCollectionCard({ current, capacity }: WaterCollectionCardProps) {
  const percentage = (current / capacity) * 100;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Droplets size={24} color={WATER.PRIMARY} />
        <Text style={styles.label}>Water Collection</Text>
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{current.toFixed(1)}L</Text>
        <Text style={styles.capacity}>of {capacity}L</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: percentage > 90 ? PROGRESS.FILL_HIGH : WATER.PRIMARY
              }
            ]} 
          />
        </View>
        <Text style={styles.percentage}>{percentage.toFixed(0)}%</Text>
      </View>

      <Text style={styles.status}>
        {percentage > 90 ? 'Tank Almost Full' :
         percentage > 70 ? 'Good Collection Rate' :
         percentage > 30 ? 'Collecting Water' : 'Low Water Level'}
      </Text>
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
    borderLeftWidth: 4,
    borderLeftColor: WATER.PRIMARY,
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
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT.MEDIUM,
    marginLeft: 12,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  value: {
    fontSize: 36,
    fontWeight: '700',
    color: WATER.PRIMARY,
  },
  capacity: {
    fontSize: 18,
    color: TEXT.LIGHT,
    marginLeft: 8,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: PROGRESS.BACKGROUND,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT.MEDIUM,
    minWidth: 40,
    textAlign: 'right',
  },
  status: {
    fontSize: 14,
    color: TEXT.LIGHT,
    fontWeight: '500',
  },
});