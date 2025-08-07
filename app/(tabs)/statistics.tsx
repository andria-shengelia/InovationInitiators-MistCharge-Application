import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { THEME, TEXT, BACKGROUND, BORDER, SHADOW, CHART } from '@/constants/colors';
import { StatusBar } from 'expo-status-bar';
import { MonthlyChart } from '@/components/MonthlyChart';
import { useStatisticsData } from '@/hooks/useStatisticsData';

export default function Statistics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30'>('7');
  const { data, loading, error } = useStatisticsData(selectedPeriod);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Statistics</Text>
          <Text style={styles.subtitle}>Water collection analytics</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === '7' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('7')}>
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === '7' && styles.periodButtonTextActive,
              ]}>
              7 Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === '30' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('30')}>
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === '30' && styles.periodButtonTextActive,
              ]}>
              30 Days
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading statistics...</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <Text style={styles.errorSubtext}>Unable to load statistics data</Text>
          </View>
        )}

        {/* Statistics Chart */}
        {!loading && !error && (
          <View style={styles.chartContainer}>
            <MonthlyChart data={data} period={selectedPeriod} />
          </View>
        )}

        {/* Summary Stats */}
        {!loading && !error && data.length > 0 && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {data.reduce((sum, item) => sum + item.amount, 0).toFixed(1)}L
                </Text>
                <Text style={styles.summaryLabel}>Total Collected</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {(data.reduce((sum, item) => sum + item.amount, 0) / data.length).toFixed(1)}L
                </Text>
                <Text style={styles.summaryLabel}>Daily Average</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.BACKGROUND,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: BACKGROUND.CARD,
    borderBottomColor: BORDER.LIGHT,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: TEXT.PRIMARY,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT.SECONDARY,
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: BACKGROUND.CARD,
    borderRadius: 12,
    padding: 4,
    ...SHADOW.SMALL,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: CHART.PRIMARY,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT.SECONDARY,
  },
  periodButtonTextActive: {
    color: THEME.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: TEXT.SECONDARY,
  },
  errorContainer: {
    backgroundColor: BACKGROUND.CARD,
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    ...SHADOW.SMALL,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 14,
    color: TEXT.SECONDARY,
  },
  chartContainer: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  summaryContainer: {
    backgroundColor: BACKGROUND.CARD,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    ...SHADOW.SMALL,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT.PRIMARY,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CHART.PRIMARY,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: TEXT.SECONDARY,
  },
  bottomSpacing: {
    height: 20,
  },
});