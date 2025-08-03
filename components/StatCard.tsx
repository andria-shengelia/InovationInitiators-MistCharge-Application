import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Video as LucideIcon } from 'lucide-react-native';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  color: string;
}

export function StatCard({ icon: Icon, title, value, change, changeType, color }: StatCardProps) {
  const changeColor = changeType === 'positive' ? '#22c55e' : '#ef4444';

  return (
    <View style={[styles.container, { width: '48%' }]}>
      <View style={styles.header}>
        <Icon size={20} color={color} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={[styles.change, { color: changeColor }]}>{change}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
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
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  change: {
    fontSize: 12,
    fontWeight: '600',
  },
});