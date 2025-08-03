import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Droplets } from 'lucide-react-native';

interface WaterCollectionCardProps {
  current: number;
  capacity: number;
}

export function WaterCollectionCard({ current, capacity }: WaterCollectionCardProps) {
  const percentage = (current / capacity) * 100;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Droplets size={24} color="#06b6d4" />
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
                backgroundColor: percentage > 90 ? '#22c55e' : '#06b6d4'
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#06b6d4',
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
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
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
    color: '#06b6d4',
  },
  capacity: {
    fontSize: 18,
    color: '#6b7280',
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
    backgroundColor: '#e2e8f0',
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
    color: '#374151',
    minWidth: 40,
    textAlign: 'right',
  },
  status: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});