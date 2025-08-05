import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield, ShieldCheck, ShieldX } from 'lucide-react-native';
import { WATER, BACKGROUND, TEXT, SHADOW } from '@/constants/colors';

interface WaterQualityCardProps {
  quality: 'safe' | 'caution' | 'unsafe';
}

export function WaterQualityCard({ quality }: WaterQualityCardProps) {
  const getQualityConfig = (qual: string) => {
    switch (qual) {
      case 'safe':
        return {
          icon: ShieldCheck,
          color: WATER.QUALITY_SAFE,
          text: 'Safe to Drink',
          description: 'Water quality is excellent',
          bgColor: BACKGROUND.SUCCESS,
        };
      case 'caution':
        return {
          icon: Shield,
          color: WATER.QUALITY_CAUTION,
          text: 'Use with Caution',
          description: 'Consider filtering before consumption',
          bgColor: BACKGROUND.WARNING,
        };
      case 'unsafe':
        return {
          icon: ShieldX,
          color: WATER.QUALITY_UNSAFE,
          text: 'Not Safe to Drink',
          description: 'Filtration required',
          bgColor: BACKGROUND.ERROR,
        };
      default:
        return {
          icon: Shield,
          color: WATER.QUALITY_UNKNOWN,
          text: 'Unknown',
          description: 'Checking water quality...',
          bgColor: BACKGROUND.INFO,
        };
    }
  };

  const config = getQualityConfig(quality);
  const IconComponent = config.icon;

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      <View style={styles.header}>
        <IconComponent size={24} color={config.color} />
        <Text style={styles.label}>Water Quality</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.status, { color: config.color }]}>
          {config.text}
        </Text>
        <Text style={styles.description}>{config.description}</Text>
        
        <View style={styles.indicators}>
          <View style={styles.indicator}>
            <Text style={styles.indicatorLabel}>pH Level</Text>
            <Text style={styles.indicatorValue}>7.2</Text>
          </View>
          <View style={styles.indicator}>
            <Text style={styles.indicatorLabel}>TDS</Text>
            <Text style={styles.indicatorValue}>45 ppm</Text>
          </View>
          <View style={styles.indicator}>
            <Text style={styles.indicatorLabel}>Chlorine</Text>
            <Text style={styles.indicatorValue}>0.1 mg/L</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: WATER.QUALITY_SAFE,
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
  content: {
    alignItems: 'flex-start',
  },
  status: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: TEXT.LIGHT,
    marginBottom: 16,
    fontWeight: '500',
  },
  indicators: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  indicator: {
    alignItems: 'center',
  },
  indicatorLabel: {
    fontSize: 12,
    color: TEXT.MUTED,
    fontWeight: '500',
    marginBottom: 4,
  },
  indicatorValue: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT.MEDIUM,
  },
});