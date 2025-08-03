import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ChartBar as BarChart3 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface StatisticsChartProps {
  data: Array<{ day: string; amount: number }>;
}

export function StatisticsChart({ data }: StatisticsChartProps) {
  const maxAmount = Math.max(...data.map(d => d.amount));
  const chartWidth = width - 64; // Account for margins and padding
  const barWidth = (chartWidth - 48) / data.length; // Account for gaps

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BarChart3 size={24} color="#3b82f6" />
        <Text style={styles.label}>7-Day Collection</Text>
      </View>

      <View style={styles.chart}>
        <View style={styles.yAxis}>
          <Text style={styles.yAxisLabel}>{maxAmount.toFixed(1)}L</Text>
          <Text style={styles.yAxisLabel}>{(maxAmount * 0.5).toFixed(1)}L</Text>
          <Text style={styles.yAxisLabel}>0L</Text>
        </View>
        
        <View style={styles.chartArea}>
          <View style={styles.barsContainer}>
            {data.map((item, index) => {
              const barHeight = (item.amount / maxAmount) * 120;
              return (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barContainer}>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: barHeight,
                          width: barWidth - 8,
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.dayLabel}>{item.day}</Text>
                  <Text style={styles.amountLabel}>{item.amount.toFixed(1)}L</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Week Total</Text>
          <Text style={styles.summaryValue}>
            {data.reduce((sum, item) => sum + item.amount, 0).toFixed(1)}L
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Daily Average</Text>
          <Text style={styles.summaryValue}>
            {(data.reduce((sum, item) => sum + item.amount, 0) / data.length).toFixed(1)}L
          </Text>
        </View>
      </View>
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
    borderLeftColor: '#3b82f6',
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
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 12,
  },
  chart: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  yAxis: {
    justifyContent: 'space-between',
    height: 140,
    marginRight: 12,
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  chartArea: {
    flex: 1,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  amountLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '500',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
});